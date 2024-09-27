import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { FilterCategoryHandler } from "../filtercategory/FilterCategoryHandler";

const FilterCategoryService : ServiceSchema = {
    name: "filtercategory",
    mixins: [KnService],
    handler: new FilterCategoryHandler(), 
}
export = FilterCategoryService;
