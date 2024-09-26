import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from "@willsofts/will-core";
import { ChatDOCHandler } from "./ChatDOCHandler";
import { QuestInfo, InquiryInfo } from "../models/QuestionAlias";
import { ChatRepository } from "./ChatRepository";
import { ollamaChat, ollamaGenerate } from "../ollama/generateOllama";

export class ChatNoteHandler extends ChatDOCHandler {
    public progid = "chatnote";
    public model : KnModel = { 
        name: "tchatnote", 
        alias: { privateAlias: this.section }, 
    };

    public override async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        console.log(this.constructor.name+":[PROCESS QUEST]",quest);
        switch (quest.agent?.toLocaleUpperCase()) {            
           
            case "GEMMA" :
            case "LLAMA" : {
                return await this.processQuestOllama(context, quest, model);
            }
            case "GEMINI" :
            default : { //otherwise GEMINI
                return await this.processQuestGemini(context, quest, model);
            }
        }
    }

    public override async processQuestGemini(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        console.log("[processQuestGemini]");
        let info : InquiryInfo = { error: false, question: quest.question, query: "", answer: "", dataset: "" };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "NOTEFILE";
        this.logger.debug(this.constructor.name+".processQuest: quest:",quest);
        const aimodel = this.getAIModel(context);
        let db = this.getPrivateConnector(model);
        let input = quest.question;
        try {
            const chatmap = ChatRepository.getInstance();
            let forum = await this.getForumConfig(db,category,context,true);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum?.tableinfo;
            let chat = chatmap.get(category);
            if(!forum?.prompt || forum.prompt.trim().length == 0) {
                info.error = true;
                info.answer = "No document info found.";
                return Promise.resolve(info);
            }
            
            if(!chat) {
                let history = this.getChatHistory(forum.prompt, table_info);
                history = this.getChatHistory(forum.prompt, table_info);
                chat = aimodel.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });
                chatmap.set(category,chat);
            }
            
            let msg = "Question: "+quest.question;
            let result = await chat.sendMessage(msg);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            info.answer = this.parseAnswer(text);
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
    public override async processQuestOllama(context: KnContextInfo, quest: QuestInfo, model: KnModel): Promise<InquiryInfo> {
        console.log("[processQuestOllama]");
        let info : InquiryInfo = { error: false, question: quest.question, query: "", answer: "", dataset: "" };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "NOTEFILE";
        this.logger.debug(this.constructor.name+".processQuest: quest:",quest);
        
        let db = this.getPrivateConnector(model);
        let input = quest.question;
        try {
            
            let forum = await this.getForumConfig(db,category,context,true);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum?.tableinfo;
            
            if(!forum?.prompt || forum.prompt.trim().length == 0) {
                info.error = true;
                info.answer = "No document info found.";
                return Promise.resolve(info);
            }
            
            var history = this.getChatHistoryOllama(forum.prompt, table_info);
            let msg = "Question: "+quest.question;
            
            // ollama normal
            let response = await ollamaChat(JSON.stringify(history), msg, quest.model!);
            // ollama use file model
            //let response = await ollamaChat(JSON.stringify(history), msg, forum.caption!);
            
            let text = response.message.content;
            console.log("[RESPONSE TEXT]:" + JSON.stringify(text));
            
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            info.answer = this.parseAnswer(text);
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
