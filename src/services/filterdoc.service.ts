import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { FilterDocumentHandler } from "../filterdoc/FilterDocumentHandler";

const FilterDocumentService : ServiceSchema = {
    name: "filterdoc",
    mixins: [KnService],
    handler: new FilterDocumentHandler(), 
}
export = FilterDocumentService;
