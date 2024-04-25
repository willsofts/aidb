import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ChatHandler } from "./ChatHandler";

export class ChatHistoryHandler extends ChatHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataView(context, model);
    }

    public async getDataView(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let history : any = [];
        let query = context.params.query;
        if(query && query.trim().length>0) {
            try {                
                let found = false;
                if(context.meta.session) {
                    let chat = context.meta.session[query];
                    if(chat && chat._history) {
                        history = chat._history
                        found = true;
                    }
                }
                if(!found) history = await this.getHistory(query);
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
            }
        }
        let title = context.params.title || "";
        return this.createDataTable(KnOperation.VIEW, {title: title, history: history}, {}, "question/history");        
    }    

}
