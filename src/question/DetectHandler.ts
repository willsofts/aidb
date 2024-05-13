import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from "@willsofts/will-core";
import { QuestInfo, InquiryInfo, FileImageInfo } from "../models/QuestionAlias";
import { KnDBConnector } from "@willsofts/will-sql";
import { VisionHandler } from "./VisionHandler";
import { API_KEY, API_MODEL } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { PDFReader } from "../detect/PDFReader";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(API_KEY);

export class DetectHandler extends VisionHandler {

    public progid = "detector";
    public model : KnModel = { 
        name: "tdetector", 
        alias: { privateAlias: this.section }, 
    };
    public handlers = [ {name: "quest"}, {name: "ask"} ];

    public override async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info : InquiryInfo = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        this.logger.debug(this.constructor.name+".processQuest: quest:",quest);
        let db = this.getPrivateConnector(model);
        try {
            let image_info = await this.getFileImageInfo(quest.image,db);
            if(image_info == null) {    
                info.error = true;
                info.answer = "No document info found.";
                return Promise.resolve(info);
            }
            if(image_info.file.length > 0) {
                info.answer = "";
                let detector = new PDFReader();
                let data = await detector.detectText(image_info.file);
                this.logger.debug(this.constructor.name+".processQuestion: data:",data);
                info = await this.processAsk(quest,data.text);
            } else {
                info.error = true;
                info.answer = "No document file found.";
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

    public async processQuestion(quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info : InquiryInfo = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        this.logger.debug(this.constructor.name+".processQuestion: quest:",quest);
        let db = this.getPrivateConnector(model);
        try {
            info.answer = "";
            let detector = new PDFReader();
            let data = await detector.detectText(quest.image);
            this.logger.debug(this.constructor.name+".processQuestion: data:",data);
            info = await this.processAsk(quest,data.text);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
		} finally {
			if(db) db.close();
        }
        this.logger.debug(this.constructor.name+".processQuestion: return:",JSON.stringify(info));
        return info;
    }

    public async getFileImageInfo(attachId: string, db?: KnDBConnector) : Promise<FileImageInfo | null> {
        let rs = await this.getAttachInfo(attachId,db);
        if(rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            let mime = row.mimetype;
            let path = row.attachpath;
            return { image: attachId, mime: mime, file: path };
        }
        return null;
    }

    public override async processAsk(quest: QuestInfo, document?: string) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: document };
        if(!quest.question || quest.question.trim().length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        if(!document || document.trim().length == 0) {
            info.error = true;
            info.answer = "No document found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = genAI.getGenerativeModel({ model: API_MODEL,  generationConfig: { temperature: 0 }});
            let input = quest.question;
            let prmutil = new PromptUtility();
            let prompt = prmutil.createDocumentPrompt(input,document);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processAsk: response:",text);
            info.answer = this.parseAnswer(text);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processAsk: return:",JSON.stringify(info));
        return info;
    }

}
