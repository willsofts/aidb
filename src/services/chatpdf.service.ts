import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ChatPDFHandler } from "../question/ChatPDFHandler";

const ChatPDFService : ServiceSchema = {
    name: "chatpdf",
    mixins: [KnService],
    handler: new ChatPDFHandler(), 
}
export = ChatPDFService;
