import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation, KnSetting } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility, KnDataMapEntitySetting, KnDataSet, KnDataEntity } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler, OPERATE_HANDLERS } from '@willsofts/will-serv';
import { ForumConfig } from "../models/QuestionAlias";

export class ForumHandler extends TknOperateHandler {
    public group = "DB";
    public progid = "forum";
    public settings : KnSetting = { rowsPerPage: 100, maxRowsPerPage: 100, maxLimit: -1, disableColumnSchema: true, disablePageOffset: true, disableQueryPaging: true };
    public model : KnModel = { 
        name: "tforum", 
        alias: { privateAlias: this.section }, 
        fields: {
            forumid: { type: "STRING", key: true },
            forumcode: { type: "STRING" },
            forumtitle: { type: "STRING" },
            forumgroup: { type: "STRING", created: true, updated: false },
            forumtype: { type: "STRING" },
            forumdialect: { type: "STRING" },
            forumapi: { type: "STRING" },
            forumurl: { type: "STRING" },
            forumuser: { type: "STRING" },
            forumpassword: { type: "STRING" },
            forumdatabase: { type: "STRING" },
            forumhost: { type: "STRING" },
            forumport: { type: "INTEGER" },
            forumselected: { type: "STRING", defaultValue: "0" },
            forumsetting: { type: "STRING" },
            forumtable: { type: "STRING" },
            forumremark: { type: "STRING" },
            forumprompt: { type: "STRING" },
            inactive: { type: "STRING", selected: true, created: false, updated: false, defaultValue: "0" },
            editflag: { type: "STRING", selected: true, created: true, updated: false, defaultValue: "1" },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: null },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: null },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
            dialectalias: { type: "STRING" , calculated: true },
            dialecttitle: { type: "STRING" , calculated: true },
            dialectoptions: { type: "STRING" , calculated: true },
        },
        //prefix naming with table name when select ex. table.column1,table.column2,...
        prefixNaming: true
    };

    public handlers = OPERATE_HANDLERS.concat([ {name: "config"}, {name: "dialect"} ]);

    public async config(context: KnContextInfo) : Promise<ForumConfig> {
        return this.callFunctional(context, {operate: "config", raw: false}, this.doConfig);
    }

    public async dialect(context: KnContextInfo) : Promise<ForumConfig> {
        return this.callFunctional(context, {operate: "dialect", raw: false}, this.doDialect);
    }

    public async doConfig(context: KnContextInfo, model: KnModel) : Promise<ForumConfig> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doConfiguring(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    public async doDialect(context: KnContextInfo, model: KnModel) : Promise<KnRecordSet> {
        let rs = await this.doDialecting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    /* try to assign individual parameters under this context */
    protected override assignParameters(context: KnContextInfo, sql: KnSQLInterface, action?: string, mode?: string) {
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
            vi = this.validateParameters(context.params,"forumtitle");
        } else {
            vi = this.validateParameters(context.params,"forumid");
        }
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected override buildFilterQuery(context: KnContextInfo, model: KnModel, knsql: KnSQLInterface, selector: string, action?: string, subaction?: string): KnSQLInterface {
        if(this.isCollectMode(action)) {
            let params = context.params;
            knsql.append(selector);
            knsql.append(" from ");
            knsql.append(model.name);
            let filter = " where ";
            if(params.forumgroup && params.forumgroup!="") {
                knsql.append(filter).append("forumgroup = ?forumgroup");
                knsql.set("forumgroup",params.forumgroup);
                filter = " and ";
            }
            if(params.forumtitle && params.forumtitle!="") {
                knsql.append(filter).append("forumtitle LIKE ?forumtitle");
                knsql.set("forumtitle","%"+params.forumtitle+"%");
                filter = " and ";
            }
            if(params.fromdate && params.fromdate!="") {
                let fromdate = Utilities.parseDate(params.fromdate);
                if(fromdate) {
                    knsql.append(filter).append("createdate >= ?fromdate");
                    knsql.set("fromdate",fromdate);
                    filter = " and ";
                }
            }
            if(params.todate && params.todate!="") {
                let todate = Utilities.parseDate(params.todate);
                if(todate) {
                    knsql.append(filter).append("createdate <= ?todate");
                    knsql.set("todate",todate);
                    filter = " and ";
                }
            }
            if(params.inactive && params.inactive!="") {
                knsql.append(filter).append("inactive = ?inactive");
                knsql.set("inactive",params.inactive);
                filter = " and ";
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
		return {tableName: "tdialect", addonFilters: "providedflag='1'", keyField: "dialectid", addonFields: "seqno", orderFields: "seqno", setting: { categoryName: "tdialect", keyName: "dialectid", valueNames: ["dialectname"]}, nameen: "dialectname", nameth: "dialectname", captionFields: "dialectname" };
    }

    protected async performCategories(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnDataTable> {
        //let settings = this.getCategorySetting(context, "tdialect");
        //let result = await this.getDataCategories(context, db, settings);
        //let entity = result.entity as KnDataEntity;
        let entity : KnDataEntity = { };
        let forumtype = {"DB":"Database","API":"API"};
        entity["tforumtype"] = forumtype;
        let tdialect : KnDataSet = { };
        let dialects : KnDataSet = { };
        let rs = await this.performDialectListing(context, model, db);
        if(rs.rows.length>0) {
            for(let i=0; i<rs.rows.length; i++) {
                let row = rs.rows[i];
                tdialect[row.dialectid] = row.dialecttitle;
                dialects[row.dialectid] = row;
            }
        }
        entity["tdialect"] = tdialect;
        entity["dialects"] = dialects;
        return this.createDataTable("categories", {}, entity);
    }

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

    protected override async performUpdating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let forumport = context.params.forumport;
        if(!forumport || forumport.trim().length==0) {
            context.params.forumport = 0;
        } 
        await this.insertQuestions(context, model, db);
        return super.performUpdating(context, model, db);
    }

    protected async performClearing(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.deleteQuestions(context, model, db, context.params.forumid);
        return super.performClearing(context, model, db);
    }

    protected async deleteQuestions(context: any, model: KnModel, db: KnDBConnector, forumid: string) : Promise<KnResultSet> {
        let knsql = new KnSQL();
        knsql.append("delete from tforumquest where forumid = ?forumid ");
        knsql.set("forumid",forumid);
        return await knsql.executeUpdate(db,context);
    }

    protected async insertQuestions(context: any, model: KnModel, db: KnDBConnector) : Promise<KnRecordSet> {
        let result : KnRecordSet = { records: 0, rows: [], columns: []};
        let forumid = context.params.forumid;
        await this.deleteQuestions(context, model, db, forumid);
        let question = context.params["question[]"];
        if(question && Array.isArray(question) && question.length>0) {
            let knsql = new KnSQL();
            knsql.append("insert into tforumquest(forumid,questid,question,seqno) values(?forumid,?questid,?question,?seqno) ");
            for(let i=0; i<question.length; i++) {
                let quest = question[i];
                if(quest.trim().length>0) {
                    knsql.set("forumid",forumid);
                    knsql.set("questid",uuid());
                    knsql.set("question",quest);
                    knsql.set("seqno",i+1);
                    let rs = await knsql.executeUpdate(db,context);
                    let res = this.createRecordSet(rs);
                    result.records += res.records;
                }
            }
        }
        return result;
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(db, context.params.forumid, context);
            if(rs.rows.length>0) {
                let row = this.transformData(rs.rows[0]);
                row.forumport = row.forumport.toString().replaceAll(",","");
                let questions = [];
                let qrs = await this.performQuestionGetting(context, db, row.forumid);
                if(qrs && qrs.rows.length>0) {
                    for(let i=0; i<qrs.rows.length; i++) {
                        questions.push(qrs.rows[i].question);                    
                    }
                }
                row.questions = questions;
                return this.createDataTable(KnOperation.RETRIEVE, row);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performRetrieving(db: KnDBConnector, forumid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select tforum.*,tdialect.dialectalias,tdialect.dialecttitle,dialectoptions ");
        knsql.append("from tforum,tdialect ");
        knsql.append("where tforum.forumid = ?forumid ");
        knsql.append("and tforum.forumdialect = tdialect.dialectid ");
        knsql.set("forumid",forumid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
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
            let rs =  await this.performRetrieving(db, context.params.forumid, context);
            if(rs.rows.length>0) {
                let row = this.transformData(rs.rows[0]);
                row.forumport = row.forumport.toString().replaceAll(",","");
                let questions = [];
                let qrs = await this.performQuestionGetting(context, db, row.forumid);
                if(qrs && qrs.rows.length>0) {
                    for(let i=0; i<qrs.rows.length; i++) {
                        questions.push(qrs.rows[i].question);                    
                    }
                }
                row.questions = questions;
                let dt = await this.performCategories(context, model, db);
                return this.createDataTable(KnOperation.RETRIEVAL, row, dt.entity, this.progid+"/"+this.progid+"_dialog");
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
        dt.dataset["forumid"] = uuid();
        return dt;
    }
    
    protected override async doInserting(context: KnContextInfo, model: KnModel): Promise<KnDataTable> {
        let rs = await this.doCreating(context, model);
        if(rs && rs.rows.length>0) {
            let row = this.transformData(rs.rows[0]);
            return this.createDataTable(KnOperation.INSERT, row);
        }
        return this.createDataTable(KnOperation.INSERT);
    }

    protected override async performCreating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let now = Utilities.now();
        let id = context.params.forumid || uuid();
        let record = {
            forumid: id,
            forumcode: context.params.forumcode || id,
            forumtitle: context.params.forumtitle || "",
            inactive: context.params.inactive || "0",
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.forumid = id;
        await this.insertQuestions(context, model, db);
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        knsql.set("forumid",record.forumid);
        knsql.set("forumcode",record.forumcode);
        knsql.set("forumgroup",context.params.forumgroup || this.group); 
        knsql.set("forumport",Utilities.parseInteger(context.params.forumport,0));
        knsql.set("createmillis",record.createmillis);
        knsql.set("createdate",record.createdate,"DATE");
        knsql.set("createtime",record.createtime,"TIME");
        knsql.set("createuser",this.userToken?.userid);
        knsql.set("editflag","1");
        let rs = await knsql.executeUpdate(db,context);
        let rcs = this.createRecordSet(rs);
        if(rcs.records>0) {
            rcs.rows = [record];
        }
        return rcs;
    }

    protected async performQuestionGetting(context: KnContextInfo, db: KnDBConnector, forumid: string): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select seqno,question ");
        knsql.append("from tforumquest ");
        knsql.append("where forumid = ?forumid ");
        knsql.append("order by seqno ");
        knsql.set("forumid",forumid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async performListing(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        let group = context.params.group;
        if(!group || group.trim().length==0) group = this.group;
        let knsql = new KnSQL();
        knsql.append("select forumid,forumtitle,forumselected,createmillis ");
        knsql.append("from tforum ");
        knsql.append("where inactive = '0' and forumgroup = ?forumgroup ");
        knsql.append("order by createmillis ");
        knsql.set("forumgroup",group);
        this.logger.debug(this.constructor.name+".performListing",knsql);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async performDialectGetting(context: KnContextInfo, db: KnDBConnector, dialectid: string): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tdialect ");
        knsql.append("where dialectid = ?dialectid ");
        knsql.set("dialectid",dialectid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async performDialectListing(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        let params = context.params;
        let knsql = new KnSQL();
        knsql.append("select dialectid,dialectalias,dialecttitle,dialectname,providedflag,urlflag,seqno ");
        knsql.append("from tdialect ");
        if(params.providedflag && params.providedflag!="") {
            knsql.append("where providedflag = ?providedflag ");
            knsql.set("providedflag",params.providedflag);
        }
        knsql.append("order by seqno ");
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected override async doList(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performListing(context, model, db);
            console.log("doList",rs);
            if(rs.rows.length>0) {
                let hasselected = false;
                let firstforum = rs.rows[0].forumid;
                let ds : KnDataSet = { };
                for(let i=0; i<rs.rows.length; i++) {
                    let row = rs.rows[i];
                    ds[row.forumid] = { title : row.forumtitle, selected: "1"==row.forumselected };
                    if(ds[row.forumid].selected) hasselected = true;
                    let qrs = await this.performQuestionGetting(context, db, row.forumid);
                    if(qrs.rows.length>0) {
                        ds[row.forumid].questions = qrs.rows;
                    }
                }
                if(!hasselected) { ds[firstforum].selected = true; }
                return this.createDataTable(KnOperation.LIST, ds);
            }
            return this.createDataTable(KnOperation.LIST);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }

    protected async doConfiguring(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<ForumConfig> {
        let db = this.getPrivateConnector(model);
        try {
            let result = await this.getForumConfig(db, context.params.forumid, context);
            if(result) return result;
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }

    protected async doDialecting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performDialectListing(context, model, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }

    public async getForumContent(forumid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performRetrieving(db, forumid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }
    
    public async getForumRecord(db: KnDBConnector, forumid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnRecordSet> {
        try {
            return await this.performRetrieving(db, forumid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public async getForumConfig(db: KnDBConnector, forumid: string, context?: KnContextInfo) : Promise<ForumConfig | undefined> {
        let result : ForumConfig | undefined = undefined;
        let rs = await this.getForumRecord(db, forumid, context);
        if(rs.rows.length>0) {
            let row = rs.rows[0];
            let dialectoptions = {};
            if(row.dialectoptions && row.dialectoptions!="") {
                try {
                    dialectoptions = JSON.parse(row.dialectoptions);
                } catch(ex: any) {
                    this.logger.error(this.constructor.name,ex);
                }
            }
            result = {
                schema: forumid,
                alias: row.dialectalias,
                dialect: row.forumdialect,
                url: row.forumurl,
                user: row.forumuser,
                password: row.forumpassword,
                host: row.forumhost,
                port: row.forumport,
                database: row.forumdatabase,
                options: dialectoptions,
                title: row.dialecttitle,
                type: row.forumtype,
                tableinfo: row.forumtable,
                api: row.forumapi,
                setting: row.forumsetting,
                prompt: row.forumprompt
            };            
        }
        return result;
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

}
