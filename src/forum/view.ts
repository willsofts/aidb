import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable, VerifyError } from "@willsofts/will-core";
import { ForumHandler } from "./ForumHandler";

/**
 * This for gui launch when view record
 */
class ForumViewHandler extends ForumHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        try {
            return await this.getDataView(context, model);
        } catch(ex: any) {
            if(ex instanceof VerifyError) {
                let ve = ex as VerifyError;
                if(-16004==ve.errno) { //record not found
                    let ds = this.emptyDataSet();
                    return this.createDataTable(KnOperation.VIEW, ds, {}, "pages/notinfo");        
                }
            }
            throw ex;
        }
    }

}

export = new ForumViewHandler();
