import { KnModel, KnTrackingInfo } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { TknOperateHandler } from '@willsofts/will-serv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY, API_VISION_MODEL } from "../utils/EnvironmentVariable";
import { QuestionUtility } from "./QuestionUtility";
import { InquiryInfo } from "./QuestionHandler";
import { TknAttachHandler } from "@willsofts/will-core";
import { KnRecordSet } from "@willsofts/will-sql";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ImageInfo {
    image: string;
    mime: string;
}

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

    public override track(context: KnContextInfo, info: KnTrackingInfo): Promise<void> {
        return Promise.resolve();
    }

    public async doQuest(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processQuest(context.params.query,context.params.mime,context.params.image);
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

    public async processQuest(question: string, mime: string, image: string) : Promise<InquiryInfo> {
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
            this.logger.debug(this.constructor.name+".processQuest: input:",input);
            let result = await aimodel.generateContent([input, image_info]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            info.answer = text;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
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
            this.logger.debug(this.constructor.name+".processQuest: input:",input);
            let result = await aimodel.generateContent([input, image_info]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            info.answer = text;
            this.deleteAttach(image);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public async deleteAttach(attachId: string) : Promise<void> {
        this.call("attach.remove",{id: attachId}).catch(ex => this.logger.error(this.constructor.name,ex));
    }

    public async getAttachImageInfo(attachId: string) : Promise<any> {
        let rs = await this.getAttachInfo(attachId);
        if(rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            let mime = row.mimetype;
            let images = row.attachstream;
            return this.getImageInfo(mime,images);
        }
        return null;
    }

    public async getAttachInfo(attachId: string) : Promise<KnRecordSet> {
        try {
            let handler = new TknAttachHandler();
            return await handler.getAttachInfo(attachId);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public getImageInfo(mime: string, images: string) {
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