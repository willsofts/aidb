import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler, OPERATE_HANDLERS } from '@willsofts/will-serv';
import { TextInfo, LabelInfo } from '../vision/VisionAlias';

export class TextHandler extends TknOperateHandler {

    public progid = "text";
    public model : KnModel = { 
        name: "ttextconfig", 
        alias: { privateAlias: this.section }, 
        fields: {
            docid: { type: "STRING", key: true },
            doctitle: { type: "STRING" },
            docfile: { type: "STRING" },
            captions: { type: "STRING" },
            inactive: { type: "STRING", selected: true, created: false, updated: false, defaultValue: "0" },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: null },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
        }
    };

    public handlers = OPERATE_HANDLERS.concat([ {name: "config"} ]);

    public async config(context: KnContextInfo) : Promise<TextInfo> {
        return this.callFunctional(context, {operate: "config", raw: false}, this.doConfig);
    }

    public async doConfig(context: KnContextInfo, model: KnModel) : Promise<TextInfo> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doConfiguring(context, model, KnOperation.GET);
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
            vi = this.validateParameters(context.params,"doctitle");
        } else {
            vi = this.validateParameters(context.params,"docid");
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
            if(params.doctitle && params.doctitle!="") {
                knsql.append(filter).append("doctitle LIKE ?doctitle");
                knsql.set("doctitle","%"+params.doctitle+"%");
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
    
    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(db, context.params.docid, context);
            if(rs.rows.length>0) {
                let row = this.transformData(rs.rows[0]);
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

    protected async doConfiguring(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<TextInfo> {
        let db = this.getPrivateConnector(model);
        try {
            let result = await this.getTextConfig(db, context.params.docid, context);
            if(result) return result;
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
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
        return this.createDataTable(KnOperation.COLLECT, this.createRecordSet(rs), {}, "text/text_data");
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
            let rs =  await this.performRetrieving(db, context.params.docid, context);
            if(rs.rows.length>0) {
                let row = this.transformData(rs.rows[0]);
                row.captionlist = [];
                let captions = row.captions;
                if(captions && captions!="") {
                    try {
                        row.captionlist = JSON.parse(captions);
                    } catch(ex: any) {
                        this.logger.error(this.constructor.name,ex);
                    }
                }
                return this.createDataTable(KnOperation.RETRIEVAL, row, {}, "text/text_dialog");
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
        let ds = this.emptyDataSet();
        ds.docid = uuid();
        let dt = this.createDataTable(KnOperation.ADD, ds, {}, "text/text_dialog");
        return dt;
    }

    protected async performRetrieving(db: KnDBConnector, docid: string,context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * from ttextconfig where docid = ?docid ");
        knsql.set("docid",docid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected override async performCreating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let now = Utilities.now();
        context.params.docid = context.params.docid || uuid();
        context.params.createmillis = Utilities.currentTimeMillis(now);
        context.params.createdate = now;
        context.params.createtime = Utilities.currentTime(now);
        context.params.createuser = this.userToken?.userid;
        let record = {
            docid: context.params.docid,
            doctitle: context.params.doctitle || "",
            inactive: context.params.inactive || "0",
            createmillis: context.params.createmillis,
            createdate: context.params.createdate,
            createtime: context.params.createtime,
        };
        let rs = await super.performCreating(context, model, db);
        let rcs = this.createRecordSet(rs);
        if(rcs.records>0) {
            rcs.rows = [record];
        }
        return rcs;
    }

    public async getTextContent(docid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performRetrieving(db, docid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public async getTextRecord(db: KnDBConnector, docid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnRecordSet> {
        try {
            return await this.performRetrieving(db, docid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public async getTextConfig(db: KnDBConnector, docid: string, context?: KnContextInfo) : Promise<TextInfo | undefined> {
        let result : TextInfo | undefined = undefined;
        let rs = await this.getTextRecord(db, docid, context);
        if(rs.rows.length>0) {
            let row = rs.rows[0];
            let captions = [];
            if(row.captions && row.captions!="") {
                try {
                    captions = JSON.parse(row.captions);
                } catch(ex: any) {
                    this.logger.error(this.constructor.name,ex);
                }
            }
            result = {
                docid: docid,
                doctitle: row.doctitle,
                captions: captions as LabelInfo[]
            };            
        }
        return result;
    }

    protected override async doList(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performListing(context, model, db);
            if(rs.rows.length>0) {
                let ds = this.createRecordSet(rs);
                return this.createDataTable(KnOperation.LIST, ds);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }

    protected async performListing(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select docid,doctitle,createmillis ");
        knsql.append("from ttextconfig ");
        knsql.append("where inactive = '0' ");
        knsql.append("order by createmillis ");
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

}
