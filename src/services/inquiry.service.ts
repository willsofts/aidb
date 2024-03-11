import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { InquiryHandler } from "../question/InquiryHandler";

const InquiryService : ServiceSchema = {
    name: "inquiry",
    mixins: [KnService],
    handler: new InquiryHandler(), 
}
export = InquiryService;
