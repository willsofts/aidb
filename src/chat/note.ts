import { KnModel,KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumNoteHandler } from "../forumnote/ForumNoteHandler";

/**
 * This for gui launch when new record
 */
class ForumNoteViewHandler extends ForumNoteHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let forumid = context.params.forumid;
        let dt = this.createDataTable(KnOperation.VIEW,{forum_id: forumid});
        dt.renderer = "chat/note";
        return dt;
    }

}

export = new ForumNoteViewHandler();
