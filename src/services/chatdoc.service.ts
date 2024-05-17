import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ChatDOCHandler } from "../question/ChatDOCHandler";

const ChatDOCService : ServiceSchema = {
    name: "chatdoc",
    mixins: [KnService],
    handler: new ChatDOCHandler(), 
}
export = ChatDOCService;
