import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { TextHandler } from "../text/TextHandler";

const TextService : ServiceSchema = {
    name: "text",
    mixins: [KnService],
    handler: new TextHandler(), 
}
export = TextService;
