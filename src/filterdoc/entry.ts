import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { FilterDocumentHandler } from "./FilterDocumentHandler";

/**
 * This for gui launch when new record
 */
class FilterDocumentEntryHandler extends FilterDocumentHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new FilterDocumentEntryHandler();
