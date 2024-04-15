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
import { VisionRotate } from "../vision/VisionRotate";

export class OCRHandler extends VisionHandler {

    public progid = "ocr";
    public model : KnModel = { 
        name: "tocr", 
        alias: { privateAlias: this.section }, 
    };
    public handlers = [ {name: "quest"}, {name: "ask"} ];

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
            let pageInfo = await vision.getPages(buffer);
            if(pageInfo) {
                let linears = vision.getWordLinears(pageInfo);
                let degree = vision.getAngleDegree(linears);
                console.log("linears:",linears.length);
                console.log("degree:",degree);
                let rotate = new VisionRotate();
                let rotateInfo = await rotate.rotate(buffer,degree);
                if(rotateInfo.rotated && rotateInfo.buffer) {
                    pageInfo = await vision.getPages(rotateInfo.buffer);
                }
                if(pageInfo) {
                    console.log("texts:",pageInfo.text);
                    console.log("=====================================");
                    info.answer = pageInfo.text;
                    let inlines = vision.inlinePages(pageInfo);
                    inlines.forEach((inline) => {
                        console.log("inline:",inline.texts);
                    });
                    console.log("=====================================");
                    let labeler = new VisionLabel();
                    let labelInfo = labeler.labelInlines(inlines, setting.captions);
                    console.log("label info:",labelInfo);
                    info.dataset = labelInfo;
                }
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
            let pageInfo = await vision.getPages(buffer);
            if(pageInfo) {
                info.answer = pageInfo.text;
                console.log("texts:",pageInfo.text);
                console.log("=====================================");
                let inlines = vision.inlinePages(pageInfo);
                inlines.forEach((inline) => {
                    console.log("inline:",inline.texts);
                });
                console.log("=====================================");
                console.log("label setting:",setting);
                let labeler = new VisionLabel();
                let labelInfo = labeler.labelInlines(inlines, setting.captions);
                console.log("label info:",labelInfo);
                info.dataset = labelInfo;
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
