import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnRecordSet, KnSQL, KnResultSet } from "@willsofts/will-sql";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { ForumHandler } from "../forum/ForumHandler";
import { TknAttachHandler } from "@willsofts/will-core";
import { FileImageInfo } from "../models/QuestionAlias";
import { QuestionUtility } from "../question/QuestionUtility";
import { OPERATE_HANDLERS } from '@willsofts/will-serv';
import { API_KEY, API_MODEL } from "../utils/EnvironmentVariable";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { PromptUtility } from "../question/PromptUtility";
import path from 'path';

const genAI = new GoogleGenerativeAI(API_KEY);

export class ForumNoteHandler extends ForumHandler {

    public group = "NOTE";
    public progid = "forumnote";

    public handlers = OPERATE_HANDLERS.concat([ {name: "config"}, {name: "dialect"}, {name: "note"} ]);

    public async note(context: KnContextInfo) : Promise<KnDataTable> {
        return this.callFunctional(context, {operate: "note", raw: false}, this.doNote);
    }

    public async doNote(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let rs = await this.doNoteGetting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    protected async doNoteGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let forumid = context.params.forumid;
            let dt = this.createDataTable(KnOperation.GET);
            let ds = await this.getForumConfig(db,forumid, context);
            if(ds) {
                dt.dataset = ds;
                dt.renderer = this.progid+"/"+this.progid+"_note";
                return dt;
            } else {
                return this.recordNotFound();
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
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
        if(!attachId || attachId.length == 0) return null;
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

    public getAIModel(context?: KnContextInfo) : GenerativeModel {
        let model = context?.params?.model;
        if(!model || model.trim().length==0) model = API_MODEL;
        return genAI.getGenerativeModel({ model: model,  generationConfig: { temperature: 0 }});
    }

    public async readDucumentFile(filePath: string, cleansing: string,context?: any) : Promise<any> {
        let isCleansing = cleansing && cleansing == "1";
        let isPDF = path.extname(filePath).toLowerCase() == ".pdf";
        let data = await QuestionUtility.readDucumentFile(filePath);
        if(isPDF && (data && data.text && data.text.trim().length > 0) && isCleansing) {
            const aimodel = this.getAIModel(context);
            let prmutil = new PromptUtility();
            let prompt = prmutil.createCleansingPrompt(data.text);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".readDucumentFile: response:",text);
            data.cleartext = text;
        }
        return Promise.resolve(data);
    }

    protected async updateDocumentInfo(db: KnDBConnector, forumid: string, context?: any) : Promise<KnResultSet | undefined> {
        let cleansing = context.params.cleansing;
        let fileid = context.params.fileid;
        let file_info = await this.getFileImageInfo(fileid,db);
        this.logger.debug(this.constructor.name+"updateDocumentInfo: fileinfo",file_info);
        if(file_info && file_info.file.length > 0) {
            let data = await this.readDucumentFile(file_info.file,cleansing,context);
            if(data && data.text && data.text.trim().length > 0) {
                let cleartext = data.cleartext ? data.cleartext : data.text; 
                let sql = new KnSQL();
                sql.append("update tforum set forumhost = ?forumhost, forumdbversion = ?forumdbversion, forumurl = ?forumurl, forumapi = ?forumapi, forumprompt = ?forumprompt, forumremark = ?forumremark ");
                sql.append("where forumid = ?forumid ");
                sql.set("forumhost",cleansing);
                sql.set("forumdbversion",context.params.model);
                sql.set("forumurl",fileid);
                sql.set("forumapi",file_info.source);
                sql.set("forumprompt",cleartext);
                sql.set("forumremark",data.text);
                sql.set("forumid",forumid);
                let rs = await sql.executeUpdate(db);
                return Promise.resolve(rs);
            }
        }
        return Promise.resolve(undefined);
    }

    protected override async performRetrieving(db: KnDBConnector, forumid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select tforum.*,tdialect.dialectalias,tdialect.dialecttitle,dialectoptions ");
        knsql.append("from tforum ");
        knsql.append("left join tdialect on tforum.forumdialect = tdialect.dialectid ");
        knsql.append("where tforum.forumid = ?forumid ");
        knsql.set("forumid",forumid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }    

    protected override async performCreating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let rs = await super.performCreating(context,model,db);
        if(rs && rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            await this.updateDocumentInfo(db,row.forumid,context);
        }
        return rs;
    }

    protected override async performUpdating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let rs = await super.performUpdating(context,model,db);
        await this.updateDocumentInfo(db,context.params.forumid,context);
        return rs;
    }

    public async getDataEntry(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.getDataAdd(context, model);
        dt.renderer = this.progid+"/"+this.progid+"_edit";
        return dt;
    }    
    
    public async getDataNote(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dialog = context.params.dialog;
        let dt = await this.doNoteGetting(context, model);
        dt.renderer = this.progid+"/"+this.progid+"_note"+(dialog ? "_dialog" : "");
        return dt;
    }    

}
