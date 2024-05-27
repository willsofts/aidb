import { KnModel,KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumHandler } from "../forum/ForumHandler";

/**
 * This for gui launch when new record
 */
class ForumViewHandler extends ForumHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let forumid = context.params.forumid;
        let dt = this.createDataTable(KnOperation.VIEW,{forum_id: forumid});
        dt.renderer = "chat/quest";
        return dt;
    }

}

export = new ForumViewHandler();
