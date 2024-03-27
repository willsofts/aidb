import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { ChatHandler } from "./ChatHandler";

/**
 * This for gui launch when view record
 */
class ChatHistoryHandler extends ChatHandler {

    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.getDataView(context, model);
    }

}

export = new ChatHistoryHandler();
