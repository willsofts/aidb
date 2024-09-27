import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { FilterGroupHandler } from "./FilterGroupHandler";

/**
 * This for gui launch when view record
 */
class FilterGroupViewHandler extends FilterGroupHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        try {
            return await this.getDataView(context, model);
        } catch(ex: any) {
            if(this.isRecordNotFound(ex)) {
                let ds = this.emptyDataSet();
                return this.createDataTable(KnOperation.VIEW, ds, {}, "pages/notinfo");        
            }
            throw ex;
        }
    }

}

export = new FilterGroupViewHandler();
