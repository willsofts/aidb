import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumHandler } from "./ForumHandler";

/**
 * This for gui launch when new record
 */
class ForumEntryHandler extends ForumHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new ForumEntryHandler();
