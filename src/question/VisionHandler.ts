import { KnModel } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { TknOperateHandler } from '@willsofts/will-serv';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { API_KEY, API_VISION_MODEL, ALWAYS_REMOVE_ATTACH } from "../utils/EnvironmentVariable";
import { QuestionUtility } from "./QuestionUtility";
import { QuestInfo, InquiryInfo, InlineImage, FileImageInfo } from "../models/QuestionAlias";
import { TknAttachHandler } from "@willsofts/will-core";
import { KnRecordSet, KnDBConnector } from "@willsofts/will-sql";

const genAI = new GoogleGenerativeAI(API_KEY);

export class VisionHandler extends TknOperateHandler {

    public progid = "vision";
    public model : KnModel = { 
        name: "tvision", 
        alias: { privateAlias: this.section }, 
    };
    public handlers = [ {name: "quest"}, {name: "ask"} ];

    public async quest(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "quest", raw: true}, this.doQuest);
    }

    public async ask(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "ask", raw: true}, this.doAsk);
    }

    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"query");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public async doQuest(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processQuest(context,{category: context.params.category, question: context.params.query, mime: context.params.mime, image: context.params.image, agent: context.params.agent, model: context.params.model || ""},model);
    }

    public async doAsk(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processAsk({category: context.params.category, question: context.params.query, mime: context.params.mime, image: context.params.image,agent: context.params.agent, model: context.params.model || ""}, context);
    }

    public validateParameter(question: string, mime: string, image: string) : KnValidateInfo {
        if(!question || question.length == 0) {
            return {valid: false, info: "question" };
        }
        if(!image || image.length == 0) {
            return {valid: false, info: "image"};
        }
        if(!mime || mime.length == 0) {
            return {valid: false, info: "mime type"};
        }
        return {valid: true};
    }

    public async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        return await this.processQuestion(quest,context);
    }

    public getAIModel(context?: KnContextInfo) : GenerativeModel {
        let model = context?.params?.model;
        if(!model || model.trim().length==0) model = API_VISION_MODEL;
        this.logger.debug(this.constructor.name+".getAIModel: using model",model);
        return genAI.getGenerativeModel({ model: model,  generationConfig: { temperature: 0 }});
    }

    public async processQuestion(quest: QuestInfo,context?: KnContextInfo) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(quest.question,quest.mime,quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = this.getAIModel(context);
            let input = quest.question;
            let image_info = this.getImageInfo(quest.mime,quest.image);
            this.logger.debug(this.constructor.name+".processQuestion: input:",input);
            let result = await aimodel.generateContent([input, image_info]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuestion: response:",text);
            info.answer = text;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processQuestion: return:",JSON.stringify(info));
        return info;
    }

    public async processAsk(quest: QuestInfo, context?: KnContextInfo) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(quest.question,"img",quest.image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        try {
            let image_info = await this.getAttachImageInfo(quest.image);
            if(image_info == null) {    
                info.error = true;
                info.answer = "No image info found.";
                return Promise.resolve(info);
            }
            const aimodel = this.getAIModel(context);
            let input = quest.question;
            this.logger.debug(this.constructor.name+".processAsk: input:",input);
            let result = await aimodel.generateContent([input, image_info]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processAsk: response:",text);
            info.answer = text;
            this.deleteAttach(quest.image);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processAsk: return:",JSON.stringify(info));
        return info;
    }

    public async deleteAttach(attachId: string) : Promise<void> {
        if(ALWAYS_REMOVE_ATTACH && (attachId && attachId.length > 0)) {
            this.call("attach.remove",{id: attachId}).catch(ex => this.logger.error(this.constructor.name,ex));
        }
    }

    public async getAttachImageInfo(attachId: string, db?: KnDBConnector) : Promise<InlineImage | null> {
        let rs = await this.getAttachInfo(attachId,db);
        if(rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            let mime = row.mimetype;
            let images = row.attachstream;
            return this.getImageInfo(mime,images);
        }
        return null;
    }

    public async getAttachInfo(attachId: string, db?: KnDBConnector) : Promise<KnRecordSet> {
        try {
            let handler = new TknAttachHandler();
            if(db) {
                return await handler.getAttachRecord(attachId,db);
            }
            return await handler.getAttachInfo(attachId);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public async getFileImageInfo(attachId: string, db?: KnDBConnector) : Promise<FileImageInfo | null> {
        let rs = await this.getAttachInfo(attachId,db);
        if(rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            let mime = row.mimetype;
            let path = row.attachpath;
            let source = row.sourcefile;
            return { image: attachId, mime: mime, file: path, source: source};
        }
        return null;
    }

    public getImageInfo(mime: string, images: string) : InlineImage {
        return {
            inlineData : {
                mimeType: mime,
                data: images
            }
        }
    }

    public getImageData(imagefile: string) {
        return QuestionUtility.getImageData(imagefile);
    }

    public parseAnswer(answer: string, defaultAnswer: boolean = true) : string {
        return QuestionUtility.parseAnswer(answer, defaultAnswer);
    }

}
