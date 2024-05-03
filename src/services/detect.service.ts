import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { DetectHandler } from "../question/DetectHandler";

const DetectService : ServiceSchema = {
    name: "detect",
    mixins: [KnService],
    handler: new DetectHandler(), 
}
export = DetectService;
