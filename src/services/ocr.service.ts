import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { OCRHandler } from "../question/OCRHandler";

const OCRService : ServiceSchema = {
    name: "ocr",
    mixins: [KnService],
    handler: new OCRHandler(), 
}
export = OCRService;
