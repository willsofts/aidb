import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { VisionHandler } from "../question/VisionHandler";

const VisionService : ServiceSchema = {
    name: "vision",
    mixins: [KnService],
    handler: new VisionHandler(), 
}
export = VisionService;
