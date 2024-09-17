import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { Service } from "moleculer";
import { Request, Response, RequestHandler } from 'express';
import { HTTP } from "@willsofts/will-api";
import { KnResponser, VerifyError, KnContextInfo } from "@willsofts/will-core";
import { UPLOAD_RESOURCES_PATH, UPLOAD_FILE_TYPES, UPLOAD_FILE_SIZE } from "../utils/EnvironmentVariable";
import { TknAttachHandler } from '@willsofts/will-core';
import { TknBaseRouter } from '@willsofts/will-core';
import { ChatImageHandler } from "../question/ChatImageHandler";
import { QuestInfo } from "../models/QuestionAlias";

const buddystorage = multer.diskStorage({
	destination: function(req, file, cb) {
		let dir = path.join(UPLOAD_RESOURCES_PATH,"uploaded","files");
		if(!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},  
	filename: function(req, file, cb) {
		let extension = path.extname(file.originalname);
		let fileid = uuid();
		let filename = fileid+extension;
		req.params.fileid = fileid;
		cb(null, filename.toLowerCase());
	}
});

export class ImageFileRouter extends TknBaseRouter {
	private fileuploader : multer.Multer;
	private uploadfile : RequestHandler;

    constructor(service: Service, dir?: string, paramname: string = "filename", fileTypes?: RegExp, fileSize?: number) {
		super(service, dir);
		this.fileuploader = this.buildMulter(fileTypes, fileSize);
		this.uploadfile = this.fileuploader.single(paramname);
    }

	private buildMulter(fileTypes: RegExp = new RegExp(UPLOAD_FILE_TYPES,"i"), fileSize: number = UPLOAD_FILE_SIZE) : multer.Multer {
		return multer({ 
			storage: buddystorage,
			limits : { fileSize : fileSize }, 
			fileFilter:  function (req, file, cb) {    
				console.log("fileFilter:",file);
				const filetypes = fileTypes;
				const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
				const mimetype = filetypes.test(file.mimetype);
				console.log("fileFilter: extname",extname+", mimetype",mimetype);	  
				if(mimetype && extname) {
					cb(null,true);
				} else {
					cb(new Error("Invalid file type"));			
				}
			}	
		});			
	}

	public doUpload(req: Request, res: Response) : void {
		this.uploadfile(req, res, (err:any) => {
			if(err) {
				KnResponser.responseError(res,err,"upload","file");
				return;
			}
			this.doUploadFile(req, res);
		});
	}

	protected getQuestInfo(context: KnContextInfo) : QuestInfo {
		return {category: context.params.category, question: context.params.query, mime: context.params.mime, image: context.params.image,agent: context.params.agent, model: context.params.model || ""};
	}

	protected async doUploadFile(req: Request, res: Response) : Promise<void> {
		res.contentType('application/json');
		if(req.file) {
			req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
		}
		console.log(this.constructor.name+".doUploadFile: body",JSON.stringify(req.body));
		console.log(this.constructor.name+".doUploadFile: file",req.file);
		let info = { error: false, question: "", query: "", answer: "", dataset: "" };
		try {
            let context = await this.createContext(req);
			context.params.file = req.file;
			let file = req.file;
			if(!file || !file.filename || !file.originalname) {
				return Promise.reject(new VerifyError("No attachment found",HTTP.NOT_ACCEPTABLE,-16091));
			}
			let stream = undefined;
			let existing = fs.existsSync(file.path);
			if(existing) {
				let buffer = fs.readFileSync(file.path, {flag:'r'});
				stream = buffer.toString("base64");
			}
			if(stream) {
				let quest = this.getQuestInfo(context);
				quest.image = stream;
				quest.mime = file.mimetype;
				let chatimage = new ChatImageHandler();
				let info = await chatimage.processAsk(quest,context);
				res.end(JSON.stringify(info));
				return;
			}
			info.error = true;
			info.answer = "No attach file found";
			res.end(JSON.stringify(info));
		} catch(ex) {
			KnResponser.responseError(res,ex,"upload","file");
		}
	}

	protected async doUploadFileAndAttach(req: Request, res: Response) : Promise<void> {
		//this process accept request with form file post and persist into table first
		res.contentType('application/json');
		if(req.file) {
			req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
		}
		console.log(this.constructor.name+".doUploadFileAndAttach: body",JSON.stringify(req.body));
		console.log(this.constructor.name+".doUploadFileAndAttach: file",req.file);
		let info = { error: false, question: "", query: "", answer: "", dataset: "" };
		try {
            let context = await this.createContext(req);
			context.params.file = req.file;
			let handler = new TknAttachHandler();
			let rs = await handler.attach(context);
			if(rs.records > 0) {
				let attachid = rs.rows?.attachid;
				if(attachid) {
					let quest = this.getQuestInfo(context);
					quest.image = attachid; //set image with attach id point to table info that using attach handler
					let chatimage = new ChatImageHandler();
					let info = await chatimage.processQuest(context,quest);
					res.end(JSON.stringify(info));
					return;
				}
			}
			info.error = true;
			info.answer = "No attach file found";
			res.end(JSON.stringify(info));
		} catch(ex) {
			KnResponser.responseError(res,ex,"upload","file");
		}
	}

}

/*

curl -X POST http://localhost:8080/file/image/ask -F filename=@D:\AI\aidb\images\po.jpg -F type=IMG -F category=MY-KEY -F query="Summarize text from information"
response:
{"error":false,"question":"Summarize text from information","query":"","answer":"This is a policy with number T17824152, the amount is 200,000.00 and it was purchased on 15/03/2024 by credit card","dataset":""}

*/
