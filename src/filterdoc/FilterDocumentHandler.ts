import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility, KnDataMapEntitySetting, KnDataSet } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler } from '@willsofts/will-serv';
import { TknAttachHandler } from "@willsofts/will-core";
import { API_KEY, API_MODEL } from "../utils/EnvironmentVariable";
import { FilterGroupHandler } from '../filtergroup/FilterGroupHandler';
import { QuestionUtility } from "../question/QuestionUtility";
import { GoogleGenerativeAI, GenerativeModel, FileDataPart } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server"; //since v0.19.0 as@12/09/2024 
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import os from "os";

const PREFIX_PROMPT = "Try to classify this resume into the following categories:";
const SUFFIX_PROMPT = "After classified the resume then answer in JSON data with the following format (with out mark down code):";
const JSON_PROMPT = `
    {
        category_names: "array of category_name found from defined categories ex. ["Category1","Category2"]",
        candidate_name: "naming of the owner resume",
        candidate_title: "naming on highest of educations",
        candidate_institute: "naming of educational institution",
        candidate_profile: "summarize resume profile shortly"
    }
`;

const genAI = new GoogleGenerativeAI(API_KEY);
let fileman = new GoogleAIFileManager(API_KEY);

export class FilterDocumentHandler extends TknOperateHandler {

    public progid = "filterdoc";
    public model : KnModel = { 
        name: "tfilterdocument", 
        alias: { privateAlias: this.section }, 
        fields: {
            filterid: { type: "STRING", key: true },
            attachid: { type: "STRING" },
            groupid: { type: "STRING" },
            filtertitle: { type: "STRING" },
            filtername: { type: "STRING" },
            filterplace: { type: "STRING" },
            filterprofile: { type: "STRING" },
            filtercategory: { type: "STRING" },
            filterremark: { type: "STRING" },
            filterdate: { type: "DATE" },
            filterfile: { type: "STRING"},
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
            groupcategories: { type: "STRING" , calculated: true },
            filtergroup: { type: "STRING", calculated: true }
        },
        prefixNaming: true
    };

    /* try to assign individual parameters under this context */
    protected override async assignParameters(context: KnContextInfo, sql: KnSQLInterface, action?: string, mode?: string) {
        sql.set("createuser",this.userToken?.userid);
        sql.set("editmillis",Utilities.currentTimeMillis());
        sql.set("editdate",Utilities.now(),"DATE");
        sql.set("edittime",Utilities.now(),"TIME");
        sql.set("edituser",this.userToken?.userid);
    }

    /* try to validate fields for insert, update, delete, retrieve */
    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi : KnValidateInfo = {valid: true};
        let page = new KnPageUtility(this.progid, context);
        if(page.isInsertMode(action)) {
            vi = this.validateParameters(context.params,"attachid","groupid");
        } else {
            vi = this.validateParameters(context.params,"filterid");
        }
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected override buildFilterQuery(context: KnContextInfo, model: KnModel, knsql: KnSQLInterface, selector: string, action?: string, subaction?: string): KnSQLInterface {
        if(this.isCollectMode(action)) {
            let counting = KnOperation.COUNT==subaction;
            let params = context.params;
            knsql.append(selector);
            if(!counting) {
                knsql.append(",tfiltergroup.groupname as filtergroup ");
            }
            knsql.append(" from ");
            knsql.append(model.name);
            knsql.append(", tfiltergroup ");
            knsql.append("where tfilterdocument.groupid = tfiltergroup.groupid ");
            let filter = " and ";
            if(params.filtername && params.filtername!="") {
                knsql.append(filter);
                knsql.append("( ");
                knsql.append(model.name).append(".filtername LIKE ?filtername or ");
                knsql.set("filtername","%"+params.filtername+"%");
                knsql.append(model.name).append(".filtertitle LIKE ?filtertitle or ");
                knsql.set("filtertitle","%"+params.filtername+"%");
                knsql.append(model.name).append(".filtercategory LIKE ?filtercategory");
                knsql.set("filtercategory","%"+params.filtername+"%");
                knsql.append(" ) ");
                filter = " and ";
            }
            if(params.filterplace && params.filterplace!="") {
                knsql.append(filter).append(model.name).append(".filterplace LIKE ?filterplace");
                knsql.set("filterplace","%"+params.filterplace+"%");
                filter = " and ";
            }
            let groupid = this.getParameterArray("groupid",params);
            if(groupid) {
                let groupids = groupid.map(item => "'"+item+"'").join(",");
                knsql.append(filter).append(model.name).append(".groupid IN (").append(groupids).append(")");
                filter = " and ";
            }
            if(params.fromdate && params.fromdate!="") {
                let fromdate = Utilities.parseDate(params.fromdate);
                if(fromdate) {
                    knsql.append(filter).append(model.name).append(".filterdate >= ?fromdate");
                    knsql.set("fromdate",fromdate);
                    filter = " and ";
                }
            }
            if(params.todate && params.todate!="") {
                let todate = Utilities.parseDate(params.todate);
                if(todate) {
                    knsql.append(filter).append(model.name).append(".filterdate <= ?todate");
                    knsql.set("todate",todate);
                    filter = " and ";
                }
            }
            return knsql;    
        }
        return super.buildFilterQuery(context, model, knsql, selector, action, subaction);
    }

    protected override async doGet(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doGetting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    protected override async doCategories(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performCategories(context, model, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public override getDataSetting(name: string) : KnDataMapEntitySetting | undefined {
		return {tableName: "tfiltergroup", keyField: "groupid", orderFields: "groupname", setting: { categoryName: "tfiltergroup", keyName: "groupid", valueNames: ["groupname"]}, nameen: "groupname", nameth: "groupname", captionFields: "groupname" };
    }

    protected async performCategories(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnDataTable> {
        let settings = this.getCategorySetting(context, "tfiltergroup"); //this setting come from method getDataSetting
        let datacategory = await this.getDataCategories(context, db, settings);
        return datacategory;
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let ds = await this.performRetrieveDataSet(db, context.params.filterid, context);
            if(ds) {
                let dt = await this.performCategories(context, model, db);
                return this.createDataTable(KnOperation.RETRIEVE, ds, dt.entity);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public async performRetrieveDataSet(db: KnDBConnector, filterid: string, context?: KnContextInfo) : Promise<KnDataSet | undefined> {
        let rs = await this.performRetrieving(db, filterid, context);
        if(rs.rows.length>0) {
            let row = await this.retrieveDataSet(db, filterid, rs, context);
            return row;
        }
        return undefined;
    }

    public async performRetrieving(db: KnDBConnector, filterid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tfilterdocument ");
        knsql.append("where filterid = ?filterid ");
        knsql.set("filterid",filterid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async retrieveDataSet(db: KnDBConnector, filterid: string, rs: KnRecordSet, context?: KnContextInfo) : Promise<KnDataSet> {
        let row = this.transformData(rs.rows[0]);
        let ars = await this.getCategoryInDocument(db, filterid, context);
        if(ars.rows.length > 0) {
            let categories = ars.rows.map((item:any) => item.categoryid);
            row["groupcategories"] = categories;
        }
        return row;
    }

    public async getCategoryInDocument(db: KnDBConnector, filterid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        if(filterid && filterid.trim().length > 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tfilterincategory ");
        knsql.append("where filterid = ?filterid ");
        knsql.set("filterid",filterid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async getRecordInfo(db: KnDBConnector, filterid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnDataSet | undefined> {
        try {
            return await this.performRetrieveDataSet(db, filterid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    protected override async doInserting(context: KnContextInfo, model: KnModel): Promise<KnDataTable> {
        let ds = await this.doClassifyDocument(context, model);
        if(!ds) return Promise.reject(new VerifyError("Cannot classify document",HTTP.NOT_FOUND,-16006));
        context.params = { ...context.params, 
            filtername: ds.candidate_name, 
            filtertitle: ds.candidate_title, 
            filterplace: ds.candidate_institute, 
            filterprofile: ds.candidate_profile,
            filtercategory: ds.category_names,
            filterremark: JSON.stringify(ds),
        };
        let rs = await this.doCreating(context, model);
        if(rs && rs.rows.length>0) {
            let row = this.transformData(rs.rows[0]);
            return this.createDataTable(KnOperation.INSERT, row);
        }
        return this.createDataTable(KnOperation.INSERT);
    }

    protected override async performCreating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {        
        let now = Utilities.now();
        let id = context.params.filterid;
        if(!id || id.trim().length == 0) id = uuid();
        let record = {
            filterid: id,
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.filterid = record.filterid;
        await this.insertCategoryDocument(db, context);
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        await this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        let categories = this.getParameterArray("filtercategory",context.params);
        knsql.set("filterid",record.filterid);
        knsql.set("attachid",context.params.attachid);
        knsql.set("groupid",context.params.groupid); 
        knsql.set("filtertitle",context.params.filtertitle); 
        knsql.set("filtername",context.params.filtername); 
        knsql.set("filterplace",context.params.filterplace); 
        knsql.set("filterprofile",context.params.filterprofile); 
        knsql.set("filtercategory",categories ? categories.join(",") : undefined); 
        knsql.set("filterremark",context.params.filterremark); 
        knsql.set("filterdate",Utilities.parseDate(context.params.filterdate),"DATE");
        knsql.set("createmillis",record.createmillis);
        knsql.set("createdate",record.createdate,"DATE");
        knsql.set("createtime",record.createtime,"TIME");
        knsql.set("createuser",this.userToken?.userid);
        let rs = await knsql.executeUpdate(db,context);
        let rcs = this.createRecordSet(rs);
        if(rcs.records>0) {
            rcs.rows = [record];
        }
        return rcs;
    }

    protected async insertCategoryDocument(db: KnDBConnector, context: KnContextInfo) : Promise<KnRecordSet> {
        let result : KnRecordSet = { records: 0, rows: [], columns: []};
        let filterid = context.params.filterid;
        await this.deleteCategoryDocument(db, filterid, context);
        let categories = this.getParameterArray("filtercategory",context.params);
        if(categories && Array.isArray(categories) && categories.length>0) {
            let knsql = new KnSQL();
            knsql.append("insert into tfilterincategory(filterid,categoryid) values(?filterid,?categoryid) ");
            for(let i=0; i<categories.length; i++) {
                let categoryid = categories[i];
                if(categoryid.trim().length>0) {
                    knsql.set("filterid",filterid);
                    knsql.set("categoryid",categoryid);
                    let rs = await knsql.executeUpdate(db,context);
                    let res = this.createRecordSet(rs);
                    result.records += res.records;
                }
            }
        }
        return result;
    }

    protected async deleteCategoryDocument(db: KnDBConnector, filterid: string,context?: KnContextInfo) : Promise<KnResultSet> {
        if(filterid && filterid.trim().length > 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("delete from tfilterincategory where filterid = ?filterid ");
        knsql.set("filterid",filterid);
        return await knsql.executeUpdate(db,context);
    }
    
    protected override async performUpdating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.insertCategoryDocument(db, context);
        return super.performUpdating(context, model, db);
    }

    protected async performClearing(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let rs = await this.performRetrieving(db, context.params.filterid, context);
        if(rs && rs.rows.length > 0) {
            let row = rs.rows[0];
            let attachid = row.attachid;
            await this.deleteAttachFile(db,attachid,context);
        }
        await this.deleteCategoryDocument(db, context.params.filterid, context);
        return super.performClearing(context, model, db);
    }

    protected async deleteAttachFile(db: KnDBConnector, attachid: string,context?: KnContextInfo) : Promise<KnResultSet> {
        if(attachid && attachid.trim().length > 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("delete from tattachfile where attachid = ?attachid ");
        knsql.set("attachid",attachid);
        return await knsql.executeUpdate(db,context);
    }

    /* ------------ UI ------------- */
    /* override to handle launch router when invoked from menu */
    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let dt = await this.performCategories(context, model, db);
            dt.action = KnOperation.EXECUTE;
            return dt;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    /**
     * Override for search action (return data collection)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataSearch(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let rs = await this.doCollecting(context, model);
        return this.createDataTable(KnOperation.COLLECT, this.createRecordSet(rs), {}, this.progid+"/"+this.progid+"_data");
    }
    
    /**
     * Override for retrieval action (return record not found error if not found any record)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataRetrieval(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let ds = await this.performRetrieveDataSet(db, context.params.filterid, context);
            if(ds) {
                let dt = await this.performCategories(context, model, db);
                return this.createDataTable(KnOperation.RETRIEVAL, ds, dt.entity, this.progid+"/"+this.progid+"_dialog");
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    /**
     * Override for add new record action (prepare screen for add)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataAdd(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.doCategories(context, model);
        dt.action = KnOperation.ADD;
        dt.renderer = this.progid+"/"+this.progid+"_dialog";
        dt.dataset["filterid"] = uuid();
        return dt;
    }

    public override async getDataEntry(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.getDataAdd(context, model);
        dt.renderer = this.progid+"/"+this.progid+"_edit";
        return dt;
    }    

    public override async getDataView(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.getDataRetrieval(context, model);
        dt.renderer = this.progid+"/"+this.progid+"_edit";
        return dt;
    }    
    
    public getAIModel(context?: KnContextInfo) : GenerativeModel {
        let model = context?.params?.model;
        if(!model || model.trim().length==0) model = API_MODEL;
        return genAI.getGenerativeModel({ model: model,  generationConfig: { temperature: 0 }});
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

    public async getFilePart(attachId: string, db?: KnDBConnector) : Promise<FileDataPart | null> {
        if(!attachId || attachId.length == 0) return null;
        let rs = await this.getAttachInfo(attachId,db);
        if(rs.rows && rs.rows.length > 0) {
            let row = rs.rows[0];
            let mime = row.mimetype;
            let filename = row.attachpath;
            let existing = fs.existsSync(filename);
            if(!existing) {
                if(row.attachstream) {
                    let name = path.basename(filename);
                    filename = path.join(os.tmpdir(),name);
                    fs.writeFileSync(filename,row.attachstream);
                    existing = true;
                }
            }
            if(existing) {
                let name = path.basename(filename);
                let upload = await fileman.uploadFile(filename,{
                    mimeType: mime,
                    displayName: name
                });
                this.logger.debug(this.constructor.name+".getFilePart: upload file response",upload);
                return {
                    fileData: {            
                        mimeType: upload.file.mimeType,
                        fileUri: upload.file.uri
                    }
                }
            }
        }
        return null;
    }

    public async getCategoryByGroup(db: KnDBConnector, groupid: string,context?: KnContextInfo) : Promise<KnRecordSet> {
        if(!groupid || groupid.trim().length == 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("SELECT tfiltercategory.categoryid,tfiltercategory.categorycode,tfiltercategory.categoryprompt ");
        knsql.append("FROM tfiltercategory,tfiltercategorygroup ");
        knsql.append("WHERE tfiltercategory.categoryid = tfiltercategorygroup.categoryid ");
        knsql.append("AND tfiltercategorygroup.groupid = ?groupid ");
        knsql.set("groupid",groupid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async createFilterPrompt(db: KnDBConnector, groupid: string, context?: KnContextInfo) : Promise<string | undefined> {
        let categories = new Array<string>();
        //find out classify group setting
        let grouper = new FilterGroupHandler();
        let gs = await grouper.performRetrieving(db,groupid,context);
        //find out categories setting
        let cs = await this.getCategoryByGroup(db,groupid,context);
        if(cs && cs.rows.length > 0) {
            for(let row of cs.rows) {
                let categoryprompt = row.categoryprompt;
                if(categoryprompt && categoryprompt.trim().length > 0) {
                    let text = "1. category_name: "+row.categoryid;
                    text += "\n"+categoryprompt.trim()+"\n";
                    categories.push(text);
                }
            }
        } 
        if(categories.length == 0) {
            return Promise.reject(new VerifyError("Classify categories not found",HTTP.NOT_FOUND,-16004));
        }
        let prefixprompt;
        let suffixprompt;
        let jsonprompt;
        if(gs && gs.rows.length > 0) {
            let row = gs.rows[0];
            prefixprompt = row.prefixprompt;
            suffixprompt = row.suffixprompt;
            jsonprompt = row.jsonprompt;
        }
        let prompt : string | undefined;
        if(!prefixprompt || prefixprompt.trim().length == 0) prefixprompt = PREFIX_PROMPT;
        if(!suffixprompt || suffixprompt.trim().length == 0) suffixprompt = SUFFIX_PROMPT;
        if(!jsonprompt || jsonprompt.trim().length == 0) jsonprompt = JSON_PROMPT;
        //compose filter prompt by categories, this prompt return known json format
        prompt = prefixprompt+"\n\n";
        categories.forEach(item => { prompt += item; });
        prompt += "\n";
        prompt += suffixprompt+"\n";
        prompt += jsonprompt;
        return prompt;
    }

    public async doClassifyDocument(context: KnContextInfo, model: KnModel) : Promise<KnDataSet | undefined> {
        let prompt : string | undefined;
        let ds : KnDataSet | undefined;
        let filepart : FileDataPart | null;
        let db = this.getPrivateConnector(model);
        try {
            let groupid = context.params.groupid;
            prompt = await this.createFilterPrompt(db,groupid,context);
            filepart = await this.getFilePart(context.params.attachid,db);
            if(!filepart) {
                return Promise.reject(new VerifyError("Attach file not found",HTTP.NOT_FOUND,-16005));
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
        if(prompt && filepart) {
            const aimodel = this.getAIModel(context);
            let result = await aimodel.generateContent([filepart,{ text: prompt }]);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".doCategorizeDocument: response.text:",text);
            let jsonstr = this.parseJSONAnswer(text);
            ds = JSON.parse(jsonstr);
        }
        return ds;
    }

    public parseJSONAnswer(answer: string) : string {
        return QuestionUtility.parseJSONAnswer(answer);
    }

    //override to download pdf file document
    public override async report(context: KnContextInfo, req: Request, res: Response): Promise<void> {
        let attachid = context.params.attachid;
        if(attachid && attachid.trim().length > 0) {
            let db = this.getPrivateConnector(this.model);
            try {
                let rs = await this.getAttachInfo(attachid,db);
                if(rs.rows && rs.rows.length > 0) {
                    let row = rs.rows[0];
                    let filename = row.sourcefile;
                    if(row.attachstream) {
                        let buffer = Buffer.from(row.attachstream,"base64");
                        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
                        res.setHeader('Content-type', 'application/pdf');
                        res.send(buffer);
                        return;                        
                    }
                }                        
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
                let err = this.getDBError(ex);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
                return Promise.reject(err);
            } finally {
                if(db) db.close();
            }
        }
        this.logger.error(this.constructor.name+".report: file not found : attachid="+attachid)
        res.status(HTTP.NOT_FOUND).send("File not found");
        return Promise.resolve();
    }

}
