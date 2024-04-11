import { KnModel } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { TknOperateHandler } from '@willsofts/will-serv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY, API_VISION_MODEL, ALWAYS_REMOVE_ATTACH } from "../utils/EnvironmentVariable";
import { QuestionUtility } from "./QuestionUtility";
import { InquiryInfo, InlineImage } from "../models/QuestionAlias";
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
        return this.processQuest(context,context.params.query,context.params.mime,context.params.image,model);
    }

    public async doAsk(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processAsk(context.params.query,context.params.image);
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

    public async processQuest(context: KnContextInfo, question: string, mime: string, image: string, model: KnModel = this.model) : Promise<InquiryInfo> {
        return await this.processQuestion(question,mime,image);
    }

    public async processQuestion(question: string, mime: string, image: string) : Promise<InquiryInfo> {
        let info = { error: false, question: question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(question,mime,image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = genAI.getGenerativeModel({ model: API_VISION_MODEL,  generationConfig: { temperature: 0 }});
            let input = question;
            let image_info = this.getImageInfo(mime,image);
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

    public async processAsk(question: string, image: string) : Promise<InquiryInfo> {
        let info = { error: false, question: question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(question,"img",image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        try {
            let image_info = await this.getAttachImageInfo(image);
            if(image_info == null) {    
                info.error = true;
                info.answer = "No image info found.";
                return Promise.resolve(info);
            }
            const aimodel = genAI.getGenerativeModel({ model: API_VISION_MODEL,  generationConfig: { temperature: 0 }});
            let input = question;
            this.logger.debug(this.constructor.name+".processAsk: input:",input);
            let result = await aimodel.generateContent([input, image_info]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processAsk: response:",text);
            info.answer = text;
            this.deleteAttach(image);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processAsk: return:",JSON.stringify(info));
        return info;
    }

    public async deleteAttach(attachId: string) : Promise<void> {
        if(ALWAYS_REMOVE_ATTACH) {
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

}
