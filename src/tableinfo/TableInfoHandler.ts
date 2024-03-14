import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { TknOperateHandler } from '@willsofts/will-serv';
import { QuestionUtility } from "../question/QuestionUtility";

export class TableInfoHandler extends TknOperateHandler {

    public progid = "tableinfo";
    public model : KnModel = { 
        name: "ttableinfo", 
        alias: { privateAlias: this.section }, 
    };

    /* override to handle launch router when invoked from menu */
    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        this.logger.info(this.constructor.name, `doExecute: category=${context.params.category}`);
        try {
            let category = context.params.category;
            let tableinfo = this.getDatabaseTableInfo(category);
            let dt = this.emptyDataSet();
            dt["tableinfo"] = tableinfo;
            return this.createDataTable(KnOperation.COLLECT, dt, {}, "tableinfo/tableinfo");
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public getDatabaseTableInfo(category: string = "") : string {
        return QuestionUtility.readDatabaseFileInfo(this.getDatabaseSchemaFile(category));
    }

    public getDatabaseSchemaFile(category: string = "") : string {
        return QuestionUtility.getDatabaseSchemaFile(category);
    }

}
