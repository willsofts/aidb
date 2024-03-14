import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { TableInfoHandler } from "../tableinfo/TableInfoHandler";

const TableInfoService : ServiceSchema = {
    name: "tableinfo",
    mixins: [KnService],
    handler: new TableInfoHandler(), 
}
export = TableInfoService;
