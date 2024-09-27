import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility, KnDataMapEntitySetting, KnDataSet } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler } from '@willsofts/will-serv';

export class FilterGroupHandler extends TknOperateHandler {

    public progid = "filtergroup";
    public model : KnModel = { 
        name: "tfiltergroup", 
        alias: { privateAlias: this.section }, 
        fields: {
            groupid: { type: "STRING", key: true },
            groupname: { type: "STRING" },
            prefixprompt: { type: "STRING" },
            suffixprompt: { type: "STRING" },
            jsonprompt: { type: "STRING" },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: Utilities.now() },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
            groupcategories: { type: "STRING" , calculated: true },
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
            vi = this.validateParameters(context.params,"groupname");
        } else {
            vi = this.validateParameters(context.params,"groupid");
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
            if(params.groupname && params.groupname!="") {
                knsql.append(filter).append("groupname LIKE ?groupname");
                knsql.set("groupname","%"+params.groupname+"%");
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
		return {tableName: "tfiltercategory", keyField: "categoryid", orderFields: "categoryname", setting: { categoryName: "tfiltercategory", keyName: "categoryid", valueNames: ["categoryname"]}, nameen: "categoryname", nameth: "categoryname", captionFields: "categoryname" };
    }

    protected async performCategories(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnDataTable> {
        let settings = this.getCategorySetting(context, "tfiltercategory"); //this setting come from method getDataSetting
        let datacategory = await this.getDataCategories(context, db, settings);
        return datacategory;
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let ds = await this.performRetrieveDataSet(db, context.params.groupid, context);
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

    public async performRetrieveDataSet(db: KnDBConnector, groupid: string, context?: KnContextInfo) : Promise<KnDataSet | undefined> {
        let rs = await this.performRetrieving(db, groupid, context);
        if(rs.rows.length>0) {
            let row = await this.retrieveDataSet(db, groupid, rs, context);
            return row;
        }
        return undefined;
    }

    public async performRetrieving(db: KnDBConnector, groupid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        if(!groupid || groupid.trim().length == 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tfiltergroup ");
        knsql.append("where groupid = ?groupid ");
        knsql.set("groupid",groupid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async retrieveDataSet(db: KnDBConnector, groupid: string, rs: KnRecordSet, context?: KnContextInfo) : Promise<KnDataSet> {
        let row = this.transformData(rs.rows[0]);
        let ars = await this.getCategoryInGroup(db, groupid, context);
        if(ars.rows.length > 0) {
            let categories = ars.rows.map((item:any) => item.categoryid);
            row["groupcategories"] = categories;
            row["categories"] = categories.join(",");
        }
        return row;
    }

    public async getCategoryInGroup(db: KnDBConnector, groupid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        if(!groupid || groupid.trim().length == 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tfiltercategorygroup ");
        knsql.append("where groupid = ?groupid ");
        knsql.set("groupid",groupid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async getRecordInfo(db: KnDBConnector, groupid: string, context?: KnContextInfo, model: KnModel = this.model) : Promise<KnDataSet | undefined> {
        try {
            return await this.performRetrieveDataSet(db, groupid, context);
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
        let id = context.params.groupid;
        if(!id || id.trim().length == 0) id = uuid();
        let record = {
            groupid: id,
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.groupid = record.groupid;
        await this.insertCategoryGroup(db, context);
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        await this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        knsql.set("groupid",record.groupid);
        knsql.set("groupname",context.params.groupname); 
        knsql.set("prefixprompt",context.params.prefixprompt); 
        knsql.set("suffixprompt",context.params.suffixprompt); 
        knsql.set("jsonprompt",context.params.jsonprompt); 
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

    protected async insertCategoryGroup(db: KnDBConnector, context: KnContextInfo) : Promise<KnRecordSet> {
        let result : KnRecordSet = { records: 0, rows: [], columns: []};
        let groupid = context.params.groupid;
        await this.deleteCategoryGroup(db, groupid, context);
        let categories = this.getParameterArray("groupcategories",context.params);
        if(categories && Array.isArray(categories) && categories.length>0) {
            let knsql = new KnSQL();
            knsql.append("insert into tfiltercategorygroup(categoryid,groupid) values(?categoryid,?groupid) ");
            for(let i=0; i<categories.length; i++) {
                let categoryid = categories[i];
                if(categoryid.trim().length>0) {
                    knsql.set("categoryid",categoryid);
                    knsql.set("groupid",groupid);
                    let rs = await knsql.executeUpdate(db,context);
                    let res = this.createRecordSet(rs);
                    result.records += res.records;
                }
            }
        }
        return result;
    }

    protected async deleteCategoryGroup(db: KnDBConnector, groupid: string,context?: KnContextInfo) : Promise<KnResultSet> {
        if(!groupid || groupid.trim().length == 0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("delete from tfiltercategorygroup where groupid = ?groupid ");
        knsql.set("groupid",groupid);
        return await knsql.executeUpdate(db,context);
    }

    protected override async performUpdating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.insertCategoryGroup(db, context);
        return super.performUpdating(context, model, db);
    }

    protected async performClearing(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.deleteCategoryGroup(db, context.params.groupid, context);
        return super.performClearing(context, model, db);
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
            let ds = await this.performRetrieveDataSet(db, context.params.groupid, context);
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
        dt.dataset["groupid"] = uuid();
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
