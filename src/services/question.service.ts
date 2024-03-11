import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { QuestionHandler } from "../question/QuestionHandler";

const QuestionService : ServiceSchema = {
    name: "question",
    mixins: [KnService],
    handler: new QuestionHandler(), 
}
export = QuestionService;
