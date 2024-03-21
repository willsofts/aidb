import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ChatHandler } from "../question/ChatHandler";

const ChatService : ServiceSchema = {
    name: "chat",
    mixins: [KnService],
    handler: new ChatHandler(), 
}
export = ChatService;
