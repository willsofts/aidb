import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ChatNoteHandler } from "../question/ChatNoteHandler";

const ChatNoteService : ServiceSchema = {
    name: "chatnote",
    mixins: [KnService],
    handler: new ChatNoteHandler(), 
}
export = ChatNoteService;
