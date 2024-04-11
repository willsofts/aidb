import { KnModel } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, VerifyError } from "@willsofts/will-core";
import { InquiryInfo } from "../models/QuestionAlias";
import { KnDBConnector } from "@willsofts/will-sql";
import { VisionHandler } from "./VisionHandler";
import { TextHandler } from "../text/TextHandler";
import { GoogleVision } from "../vision/GoogleVision";
import { VisionLabel } from "../vision/VisionLabel";
import { TextInfo } from "../vision/VisionAlias";

export class OCRHandler extends VisionHandler {

    public override async processQuest(context: KnContextInfo, question: string, mime: string, image: string, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info : InquiryInfo = { error: false, question: question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(question,mime,image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        let db = this.getPrivateConnector(model);
        try {
            let image_info = await this.getAttachImageInfo(image,db);
            if(image_info == null) {    
                info.error = true;
                info.answer = "No image info found.";
                return Promise.resolve(info);
            }
            let setting = await this.getTextConfig(db,mime,context);            
            let vision = new GoogleVision();
            let buffer = Buffer.from(image_info.inlineData.data, 'base64');
            let pages = await vision.getPages(buffer);
            if(pages) {
                info.answer = pages.text;
                console.log("texts:",pages.text);
                console.log("=====================================");
                let inlines = vision.inlinePages(pages);
                inlines.forEach((inline) => {
                    console.log("inline:",inline.texts);
                });
                console.log("=====================================");
                console.log("label setting:",setting);
                let labeler = new VisionLabel();
                let results = labeler.labelInlines(inlines, setting.captions);
                console.log("results:",results);
                info.dataset = results;
            }
            this.deleteAttach(image);
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

    public async processQuestion(question: string, mime: string, image: string, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info : InquiryInfo = { error: false, question: question, query: "", answer: "", dataset: [] };
        let valid = this.validateParameter(question,mime,image);
        if(!valid.valid) {
            info.error = true;
            info.answer = "No "+valid.info+" found.";
            return Promise.resolve(info);
        }
        let db = this.getPrivateConnector(model);
        try {
            let setting = await this.getTextConfig(db,mime);            
            let vision = new GoogleVision();
            let buffer = Buffer.from(image, 'base64');
            let pages = await vision.getPages(buffer);
            if(pages) {
                info.answer = pages.text;
                console.log("texts:",pages.text);
                console.log("=====================================");
                let inlines = vision.inlinePages(pages);
                inlines.forEach((inline) => {
                    console.log("inline:",inline.texts);
                });
                console.log("=====================================");
                console.log("label setting:",setting);
                let labeler = new VisionLabel();
                let results = labeler.labelInlines(inlines, setting.captions);
                console.log("results:",results);
                info.dataset = results;
            }
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

    public async getTextConfig(db: KnDBConnector, docid: string, context?: KnContextInfo) : Promise<TextInfo> {
        let handler = new TextHandler();
        let result = await handler.getTextConfig(db,docid,context);
        if(!result) {
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
        }
        return result;
    }

}
