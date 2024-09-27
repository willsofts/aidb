import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { FilterGroupHandler } from "../filtergroup/FilterGroupHandler";

const FilterGroupService : ServiceSchema = {
    name: "filtergroup",
    mixins: [KnService],
    handler: new FilterGroupHandler(), 
}
export = FilterGroupService;
