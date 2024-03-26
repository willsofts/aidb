import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnDataTable, VerifyError, KnValidateInfo } from '@willsofts/will-core';
import { HTTP } from "@willsofts/will-api";
import { TknOperateHandler } from '@willsofts/will-serv';
import { QuestionUtility } from "../question/QuestionUtility";

export class TableInfoHandler extends TknOperateHandler {

    public progid = "tableinfo";
    public model : KnModel = { 
        name: "tforum", 
        alias: { privateAlias: this.section }, 
    };

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(context, db, context.params.category);
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

    protected async performRetrieving(context: KnContextInfo, db: KnDBConnector, forumid: string): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select forumtable ");
        knsql.append("from tforum ");
        knsql.append("where forumid = ?forumid ");
        knsql.set("forumid",forumid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"category");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    /* override to handle launch router when invoked from menu */
    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        this.logger.info(this.constructor.name, `doExecute: category=${context.params.category}`);
        let db = this.getPrivateConnector(model);
        try {
            let category = context.params.category;
            //let tableinfo = this.getDatabaseTableInfo(category);
            let tableinfo = "";
            let rs = await this.performRetrieving(context, db, category);
            if(rs.rows.length>0) {
                tableinfo = rs.rows[0].forumtable;
            }
            let dt = this.emptyDataSet();
            dt["tableinfo"] = tableinfo;
            return this.createDataTable(KnOperation.COLLECT, dt, {}, "tableinfo/tableinfo");
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }
    
    protected override async doHtml(context: KnContextInfo, model: KnModel) : Promise<string> {
        let category = context.params.category;
        //return this.getDatabaseTableInfo(category);
        return this.getTableInfo(context, category, model);
    }

    public async getTableInfo(context: KnContextInfo, category: string, model: KnModel = this.model): Promise<string> {
        let db = this.getPrivateConnector(model);
        try {
            let tableinfo = "";
            let rs = await this.performRetrieving(context, db, category);
            if(rs.rows.length>0) {
                tableinfo = rs.rows[0].forumtable;
            }
            return tableinfo;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public getDatabaseTableInfo(category: string = "") : string {
        return QuestionUtility.readDatabaseFileInfo(this.getDatabaseSchemaFile(category));
    }

    public getDatabaseSchemaFile(category: string = "") : string {
        return QuestionUtility.getDatabaseSchemaFile(category);
    }

}
