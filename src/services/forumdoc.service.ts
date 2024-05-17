import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ForumDocHandler } from "../forumdoc/ForumDocHandler";

const ForumDocService : ServiceSchema = {
    name: "forumdoc",
    mixins: [KnService],
    handler: new ForumDocHandler(), 
}
export = ForumDocService;
