import { KnDBConnector, KnRecordSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo } from '@willsofts/will-core';
import { ForumHandler } from "../forum/ForumHandler";

export class ForumDocHandler extends ForumHandler {

    public group = "DOC";
    public progid = "forumdoc";

    protected async performRetrieving(db: KnDBConnector, forumid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select tforum.*,tdialect.dialectalias,tdialect.dialecttitle,dialectoptions ");
        knsql.append("from tforum ");
        knsql.append("left join tdialect on tforum.forumdialect = tdialect.dialectid ");
        knsql.append("where tforum.forumid = ?forumid ");
        knsql.set("forumid",forumid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }    

}
