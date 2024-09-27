import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { FilterGroupHandler } from "./FilterGroupHandler";

/**
 * This for gui launch when new record
 */
class FilterGroupEntryHandler extends FilterGroupHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new FilterGroupEntryHandler();
