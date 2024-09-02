import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ChatImageHandler } from "../question/ChatImageHandler";

const ChatImageService : ServiceSchema = {
    name: "chatimage",
    mixins: [KnService],
    handler: new ChatImageHandler(), 
}
export = ChatImageService;
