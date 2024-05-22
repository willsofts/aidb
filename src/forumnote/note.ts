import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ForumNoteHandler } from "./ForumNoteHandler";

/**
 * This for gui launch when view record
 */
class ForumNoteInfoHandler extends ForumNoteHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let ajax = context.params.ajax;
        try {
            return await this.getDataNote(context, model);
        } catch(ex: any) {
            if(ajax) {
                throw ex;
            }
            if(this.isRecordNotFound(ex)) {
                let ds = this.emptyDataSet();
                return this.createDataTable(KnOperation.VIEW, ds, {}, "pages/notinfo"); 
            }
            throw ex;
        }
    }

}

export = new ForumNoteInfoHandler();
