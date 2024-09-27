import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnDataSet, KnPageUtility } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler } from '@willsofts/will-serv';

export class FilterCategoryHandler extends TknOperateHandler {

    public progid = "filtercategory";
    public model : KnModel = { 
        name: "tfiltercategory", 
        alias: { privateAlias: this.section }, 
        fields: {
            categoryid: { type: "STRING", key: true },
            categorycode: { type: "STRING" },
            categoryname: { type: "STRING" },
            categoryprompt: { type: "STRING" },
            categoryremark: { type: "STRING", updated: true },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
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
        if(page.isInsertMode(action) || KnOperation.UPDATE==action) {
            vi = this.validateParameters(context.params,"categoryid","categoryname","categoryprompt");
        } else {
            vi = this.validateParameters(context.params,"categoryid");
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
            if(params.categoryname && params.categoryname!="") {
                knsql.append(filter).append("categoryname LIKE ?categoryname");
                knsql.set("categoryname","%"+params.categoryname+"%");
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
            return knsql;    
        }
        return super.buildFilterQuery(context, model, knsql, selector, action, subaction);
    }

    protected override async doGet(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doGetting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let ds = await this.performRetrieveDataSet(db, context.params.categoryid, context);
            if(ds) {
                return this.createDataTable(KnOperation.RETRIEVE, ds, {});
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public async performRetrieveDataSet(db: KnDBConnector, categoryid: string, context?: KnContextInfo) : Promise<KnDataSet | undefined> {
        let rs = await this.performRetrieving(db, categoryid, context);
        if(rs.rows.length>0) {
            let row = await this.retrieveDataSet(db, categoryid, rs, context);
            return row;
        }
        return undefined;
    }

    public async performRetrieving(db: KnDBConnector, categoryid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        if(!categoryid || categoryid.trim().length == 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tfiltercategory ");
        knsql.append("where categoryid = ?categoryid ");
        knsql.set("categoryid",categoryid);
        this.logger.debug(this.constructor.name+".performRetrieving:",knsql);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async retrieveDataSet(db: KnDBConnector, categoryid: string, rs: KnRecordSet, context?: KnContextInfo) : Promise<KnDataSet | undefined> {
        return this.transformData(rs.rows[0]);
    }

    public async getRecordInfo(db: KnDBConnector, categoryid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnDataSet | undefined> {
        try {
            return await this.performRetrieveDataSet(db, categoryid, context);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    protected override async doInserting(context: KnContextInfo, model: KnModel): Promise<KnDataTable> {
        let rs = await this.doCreating(context, model);
        if(rs && rs.rows.length>0) {
            let row = this.transformData(rs.rows[0]);
            return this.createDataTable(KnOperation.INSERT, row);
        }
        return this.createDataTable(KnOperation.INSERT);
    }

    protected override async performCreating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let now = Utilities.now();
        let id = context.params.categoryid;
        if(!id || id.trim().length == 0) id = uuid();
        let record = {
            categoryid: id,
            categorycode: context.params.categorycode || id,
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.categoryid = record.categoryid;
        context.params.categorycode = record.categorycode;
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        await this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        knsql.set("categoryid",record.categoryid);
        knsql.set("categorycode",record.categorycode);
        knsql.set("categoryname",context.params.categoryname); 
        knsql.set("categoryprompt",context.params.categoryprompt); 
        knsql.set("categoryremark",context.params.categoryremark); 
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

    /* ------------ UI ------------- */
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
            let ds = await this.performRetrieveDataSet(db, context.params.categoryid, context);
            if(ds) {
                return this.createDataTable(KnOperation.RETRIEVAL, ds, {}, this.progid+"/"+this.progid+"_dialog");
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
        let dt = this.createDataTable(KnOperation.ADD);
        dt.renderer = this.progid+"/"+this.progid+"_dialog";
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

}
