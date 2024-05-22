import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ForumNoteHandler } from "../forumnote/ForumNoteHandler";

const ForumNoteService : ServiceSchema = {
    name: "forumnote",
    mixins: [KnService],
    handler: new ForumNoteHandler(), 
}
export = ForumNoteService;
