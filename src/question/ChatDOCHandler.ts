import { KnModel } from "@willsofts/will-db";
import { KnDBConnector } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, VerifyError } from "@willsofts/will-core";
import { ChatPDFHandler } from "./ChatPDFHandler";
import { QuestInfo, InquiryInfo, ForumConfig } from "../models/QuestionAlias";
import { ChatRepository } from "./ChatRepository";
import { QuestionUtility } from "./QuestionUtility";
import { ForumDocHandler } from "../forumdoc/ForumDocHandler";

export class ChatDOCHandler extends ChatPDFHandler {
    public progid = "chatdoc";
    public model : KnModel = { 
        name: "tchatdoc", 
        alias: { privateAlias: this.section }, 
    };

    public readDucumentFile(filePath: string) : Promise<any> {
        return QuestionUtility.readDucumentFile(filePath);
    }

    public async getForumConfig(db: KnDBConnector, category: string,context?: KnContextInfo, throwNotFoundError: boolean = false) : Promise<ForumConfig | undefined> {
        let handler = new ForumDocHandler();
        let result = await handler.getForumConfig(db,category,context);
        if(!result && throwNotFoundError) {
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
        }
        return result;
    }

    public override async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info : InquiryInfo = { error: false, question: quest.question, query: "", answer: "", dataset: "" };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "DOCFILE";
        this.logger.debug(this.constructor.name+".processQuest: quest:",quest);
        const aimodel = this.getAIModel();
        let db = this.getPrivateConnector(model);
        let input = quest.question;
        try {
            const chatmap = ChatRepository.getInstance();
            let forum = await this.getForumConfig(db,category,context);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum?.tableinfo;
            let chat = chatmap.get(category);
            let image_info = await this.getFileImageInfo(quest.image,db);
            if(image_info == null && !chat) {    
                info.error = true;
                info.answer = "No document info found.";
                return Promise.resolve(info);
            }
            if(image_info && image_info.file.length > 0) {
                info.answer = "";
                let data = await this.readDucumentFile(image_info.file);
                this.logger.debug(this.constructor.name+".processQuestion: data:",data);
                if(data.text.trim().length == 0) {
                    info.error = true;
                    info.answer = "No text found in document file.";
                    return Promise.resolve(info);
                }
                info.dataset = data.text;
                if(chat) {
                    chatmap.remove(category);
                }   
                let history = this.getChatHistory(data.text, table_info);
                chat = aimodel.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });
                chatmap.set(category,chat);
                let msg = "Question: "+quest.question;
                let result = await chat.sendMessage(msg);
                let response = result.response;
                let text = response.text();
                this.logger.debug(this.constructor.name+".processQuest: response:",text);
                info.answer = this.parseAnswer(text);
            } else {
                if(chat) {
                    let msg = "Question: "+quest.question;
                    let result = await chat.sendMessage(msg);
                    let response = result.response;
                    let text = response.text();
                    this.logger.debug(this.constructor.name+".processQuest: response:",text);
                    info.answer = this.parseAnswer(text);    
                } else {
                    info.error = true;
                    info.answer = "No document file found.";
                }
            }
            this.deleteAttach(quest.image);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
		} finally {
			if(db) db.close();
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

}
