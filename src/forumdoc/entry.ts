import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumDocHandler } from "./ForumDocHandler";

/**
 * This for gui launch when new record
 */
class ForumDocEntryHandler extends ForumDocHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new ForumDocEntryHandler();
