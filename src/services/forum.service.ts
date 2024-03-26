import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ForumHandler } from "../forum/ForumHandler";

const ForumService : ServiceSchema = {
    name: "forum",
    mixins: [KnService],
    handler: new ForumHandler(), 
}
export = ForumService;
