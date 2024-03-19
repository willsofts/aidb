import { KnModel, KnTrackingInfo } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { InquiryHandler } from "./InquiryHandler";
import { TknOperateHandler } from '@willsofts/will-serv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY, API_MODEL, API_ANSWER } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { QuestionUtility } from "./QuestionUtility";
import { KnRecordSet } from "@willsofts/will-sql";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface InquiryInfo {
    error: boolean;
    question: string;
    query: string;
    answer: string;
    dataset: any;
}

export class QuestionHandler extends TknOperateHandler {

    public progid = "question";
    public model : KnModel = { 
        name: "tquestion", 
        alias: { privateAlias: this.section }, 
    };
    public handlers = [ {name: "quest"}, {name: "ask"} ];

    public async quest(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "quest", raw: true}, this.doQuest);
    }

    public async ask(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "ask", raw: true}, this.doAsk);
    }

    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"query");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public override track(context: KnContextInfo, info: KnTrackingInfo): Promise<void> {
        return Promise.resolve();
    }

    public async doQuest(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processQuest(context.params.query,context.params.category);
    }

    public async doAsk(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        return this.processAsk(context.params.query);
    }

    public async doInquiry(sql: string, section: string = this.section) : Promise<KnRecordSet> {
        try {
            let handler = new InquiryHandler();
            return await handler.processInquire(sql, section);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public async processQuest(question: string, category: string = "AIDB") : Promise<InquiryInfo> {
        let info = { error: false, question: question, query: "", answer: "", dataset: [] };
        if(!question || question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = genAI.getGenerativeModel({ model: API_MODEL,  generationConfig: { temperature: 0 }});
            let input = question;
            let table_info = this.getDatabaseTableInfo(category);
            this.logger.debug(this.constructor.name+".processQuestion: input:",input);
            this.logger.debug(this.constructor.name+".processQuestion: category:",category);
            //create question prompt with table info
            let prmutil = new PromptUtility();
            let prompt = prmutil.createQueryPrompt(input, table_info);
            let { totalTokens } = await aimodel.countTokens(prompt);            
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuestion: response:",text);
            this.logger.debug(this.constructor.name+".processQuestion: total tokens:", totalTokens);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,false);
            this.logger.debug(this.constructor.name+".processQuestion: sql:",sql);
            if(sql.length == 0) {
                info.error = true;
                info.answer = "No SQL found in the response.";
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doInquiry(sql, category);
            this.logger.debug(this.constructor.name+".processQuestion: rs:",rs);
            if(rs.records == 0) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                //create reply prompt from sql and result set
                prompt = prmutil.createQuestPrompt(input, datarows, sql, "");
                result = await aimodel.generateContent(prompt);
                response = result.response;
                text = response.text();
                this.logger.debug(this.constructor.name+".processQuestion: response:",text);
                info.answer = this.parseAnswer(text);
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processQuestion: return:",JSON.stringify(info));
        return info;
    }

    public async processAsk(question: string) : Promise<InquiryInfo> {
        let info = { error: false, question: question, query: "", answer: "", dataset: [] };
        if(!question || question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = genAI.getGenerativeModel({ model: API_MODEL,  generationConfig: { temperature: 0 }});
            let input = question;
            let prmutil = new PromptUtility();
            let prompt = prmutil.createAskPrompt(input);
            let { totalTokens } = await aimodel.countTokens(prompt);            
            this.logger.debug(this.constructor.name+".processAsk: total tokens:", totalTokens);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processAsk: response:",text);
            info.answer = this.parseAnswer(text);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processAsk: return:",JSON.stringify(info));
        return info;
    }

    public parseAnswer(answer: string, defaultAnswer: boolean = true) : string {
        return QuestionUtility.parseAnswer(answer, defaultAnswer);
    }

    public getDatabaseTableInfo(category: string = "") : string {
        return QuestionUtility.readDatabaseFileInfo(this.getDatabaseSchemaFile(category));
    }

    public getDatabaseSchemaFile(category: string = "") : string {
        return QuestionUtility.getDatabaseSchemaFile(category);
    }

}
