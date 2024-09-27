import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { FilterCategoryHandler } from "./FilterCategoryHandler";

/**
 * This for gui launch when new record
 */
class FilterCategoryEntryHandler extends FilterCategoryHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new FilterCategoryEntryHandler();
