import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumNoteHandler } from "./ForumNoteHandler";

/**
 * This for gui launch when new record
 */
class ForumNoteEntryHandler extends ForumNoteHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataEntry(context, model);
    }

}

export = new ForumNoteEntryHandler();
