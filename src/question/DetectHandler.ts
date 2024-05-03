import { KnModel } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, VerifyError } from "@willsofts/will-core";
import { InquiryInfo, FileImageInfo } from "../models/QuestionAlias";
import { KnDBConnector } from "@willsofts/will-sql";
import { VisionHandler } from "./VisionHandler";
import { TextHandler } from "../text/TextHandler";
import { GoogleVision } from "../vision/GoogleVision";
import { VisionLabel } from "../vision/VisionLabel";
import { TextInfo, LabelInfo } from "../vision/VisionAlias";
import { VisionRotate } from "../vision/VisionRotate";
import { API_KEY, API_MODEL } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { PDFDetector } from "../detect/PDFDetector";

export class DetectHandler extends VisionHandler {

    public progid = "detect";
    public model : KnModel = { 
        name: "tdetect", 
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
            let image_info = await this.getFileImageInfo(image,db);
            if(image_info == null) {    
                info.error = true;
                info.answer = "No image info found.";
                return Promise.resolve(info);
            }
            if(image_info.file.length > 0) {
                info.answer = "";
                let detector = new PDFDetector();
                let text = await detector.detectText(image_info.file);
                if(text) info.answer = text;
            } else {
                info.error = true;
                info.answer = "No image file found.";
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
            info.answer = "";
            let detector = new PDFDetector();
            let text = await detector.detectText(image);
            if(text) info.answer = text;
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

}
