import { KnModel } from "@willsofts/will-db";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { KnRecordSet, KnDBConnector } from "@willsofts/will-sql";
import { InquiryHandler } from "./InquiryHandler";
import { TknOperateHandler } from '@willsofts/will-serv';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { API_KEY, API_ANSWER, API_ANSWER_RECORD_NOT_FOUND, API_VISION_MODEL, API_MODEL_CLAUDE, API_OLLAMA_HOST, API_OLLAMA_TIMEOUT } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { QuestionUtility } from "./QuestionUtility";
import { QuestInfo, InquiryInfo, ForumConfig } from "../models/QuestionAlias";
import { ForumHandler } from "../forum/ForumHandler";
import { KnDBLibrary } from "../utils/KnDBLibrary";
import { claudeProcess } from "../claude/generateClaudeSystem";
import ollama from "ollama";
import { Ollama } from 'ollama'
import { PromptOLlamaUtility } from "./PromptOLlamaUtility";
import { ollamaChat, ollamaGenerate } from "../ollama/generateOllama";

const genAI = new GoogleGenerativeAI(API_KEY);

export class QuestionHandler extends TknOperateHandler {

    public progid = "question";
    public model : KnModel = { 
        name: "tquestion", 
        alias: { privateAlias: this.section }, 
    };

    public handlers = [ {name: "quest"}, {name: "ask"}, {name: "history"}, {name: "view"}, {name: "reset"}];

    public async history(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "history", raw: false}, this.doHistory);
    }

    public async quest(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "quest", raw: true}, this.doQuest);
    }

    public async ask(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "ask", raw: true}, this.doAsk);
    }

    public async reset(context: KnContextInfo) : Promise<InquiryInfo> {
        return this.callFunctional(context, {operate: "reset", raw: true}, this.doReset);
    }

    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        return this.validateInputFields(context, model, "query");
    }

    protected validateInputFields(context: KnContextInfo, model: KnModel, ...fieldname: string[]) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,...fieldname);
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public async performQuest(context: KnContextInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        return this.processQuest(context, {question: context.params.query, category: context.params.category || "AIDB", mime: context.params.mime, image: context.params.image, agent: context.params.agent, model: context.params.model || ""}, model);
    }

    public async doQuest(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        await this.validateInputFields(context, model, "query", "category");
        return this.performQuest(context, model);
    }

    public async doAsk(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        await this.validateInputFields(context, model, "query");
        return this.processAsk({question: context.params.query, category: context.params.category || "AIDB", mime: context.params.mime, image: context.params.image, agent: context.params.agent, model: context.params.model || ""},context);
    }

    public async doReset(context: KnContextInfo, model: KnModel) : Promise<InquiryInfo> {
        await this.validateInputFields(context, model, "category");
        return this.processReset(context.params.category);
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

    public async doEnquiry(sql: string, forum: ForumConfig) : Promise<KnRecordSet> {
        if(forum.type=="DB") {
            return this.processEnquiry(sql, forum);
        }
        return this.processAPI(sql, forum);
    }

    public async processEnquiry(sql: string, forum: ForumConfig) : Promise<KnRecordSet> {
        let db = this.getConnector(forum);
        try {
            let handler = new InquiryHandler();
            return await handler.processEnquiry(sql, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getDatabaseVersioning(forum: ForumConfig) : Promise<string> {
        if(forum.type=="DB") {
            let db = this.getConnector(forum);
            try {
                let result = await KnDBLibrary.getDBVersion(db, forum);
                if(result && result.trim().length>0) return result;
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
                return Promise.reject(this.getDBError(ex));
            } finally {
                if(db) db.close();
            }
        }
        return forum.version || "";
    }

    public getAIModel(context?: KnContextInfo) : GenerativeModel {
        let model = context?.params?.model;
        if(!model || model.trim().length==0) model = API_VISION_MODEL;
        this.logger.debug(this.constructor.name+".getAIModel: using model",model);
        return genAI.getGenerativeModel({ model: model,  generationConfig: { temperature: 0 }});
    }

    public async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        if(quest.agent=="GEMINI") {
            return await this.processQuestGemini(context, quest, model);
        }
        return await this.processQuestGemini(context, quest, model);        
    }

    public async processQuestGemini(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.trim().length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "AIDB";
        const aimodel = this.getAIModel(context);
        let input = quest.question;
        let db = this.getPrivateConnector(model);
        try {
            let forum = await this.getForumConfig(db,category,context);
            let table_info = forum.tableinfo;
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let version = await this.getDatabaseVersioning(forum);
            //create question prompt with table info
            let prmutil = new PromptUtility();
            let prompt = prmutil.createQueryPrompt(input, table_info, version);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,false);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doEnquiry(sql, forum);
            this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
            if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                prompt = prmutil.createAnswerPrompt(input, datarows, forum.prompt);
                result = await aimodel.generateContent(prompt);
                response = result.response;
                text = response.text();
                this.logger.debug(this.constructor.name+".processQuest: response:",text);
                info.answer = this.parseAnswer(text);
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
		} finally {
			if(db) db.close();
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public async processQuestClaude(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.trim().length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "AIDB";
        let input = quest.question;
        let db = this.getPrivateConnector(model);
        try {
            let forum = await this.getForumConfig(db,category,context);
            let table_info = forum.tableinfo;
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let version = await this.getDatabaseVersioning(forum);
            //create question prompt with table info
            let prmutil = new PromptUtility();
            let system_prompt = prmutil.createClaudeQueryPrompt(table_info, version);
            let model = context?.params?.model;
            if(!model || model.trim().length==0) model = API_MODEL_CLAUDE;
            let result = await claudeProcess(system_prompt, input, model);
            this.logger.debug(this.constructor.name+".processQuest: response:",result);
            //try to extract SQL from the response
            let sql = this.parseAnswer(result,false);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doEnquiry(sql, forum);
            this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
            if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                system_prompt = prmutil.createAnswerPrompt(input, datarows, forum.prompt);
                let result = await claudeProcess(system_prompt, input, model);
                this.logger.debug(this.constructor.name+".processQuest: response:",result);
                info.answer = this.parseAnswer(result);
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
		} finally {
			if(db) db.close();
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public async processQuestOllama(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.trim().length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "AIDB";
        const aimodel = this.getAIModel(context);
        let input = quest.question;
        let db = this.getPrivateConnector(model);
        try {
            let forum = await this.getForumConfig(db,category,context);
            let table_info = forum.tableinfo;
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let version = await this.getDatabaseVersioning(forum);
            //create question prompt with table info
            let prmutil = new PromptUtility();
            let prompt = prmutil.createQueryPrompt(input, table_info, version);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,false);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doEnquiry(sql, forum);
            this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
            if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                prompt = prmutil.createAnswerPrompt(input, datarows, forum.prompt);
                result = await aimodel.generateContent(prompt);
                response = result.response;
                text = response.text();
                this.logger.debug(this.constructor.name+".processQuest: response:",text);
                info.answer = this.parseAnswer(text);
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
		} finally {
			if(db) db.close();
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public async processQuestion(quest: QuestInfo, context?: KnContextInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        if(quest.agent=="GEMINI") {
            return await this.processQuestionGemini(quest, context, model);
        }
        return await this.processQuestionGemini(quest, context, model);            
    }

    public async processQuestionGemini(quest: QuestInfo, context?: KnContextInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        //old fashion by file system handler
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "AIDB";
        try {
            const aimodel = this.getAIModel(context);
            let input = quest.question;
            let table_info = this.getDatabaseTableInfo(category);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let version = "";
            //create question prompt with table info
            let prmutil = new PromptUtility();
            let prompt = prmutil.createQueryPrompt(input, table_info, version);
            let result = await aimodel.generateContent(prompt);
            let response = result.response;
            let text = response.text();
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,false);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doInquiry(sql, category);
            this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
            if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                prompt = prmutil.createAnswerPrompt(input, datarows);
                result = await aimodel.generateContent(prompt);
                response = result.response;
                text = response.text();
                this.logger.debug(this.constructor.name+".processQuest: response:",text);
                info.answer = this.parseAnswer(text);
            }
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public async processAsk(quest: QuestInfo | string, context?: KnContextInfo) : Promise<InquiryInfo> {
        if(typeof quest == "string") {
            return await this.processAskGemini(quest, context);
        }
        console.log(this.constructor.name+":[PROCESS QUEST]",quest);
        switch (quest.agent?.toLocaleUpperCase()) {            
            case "GEMMA" :
            case "LLAMA" : {
                return await this.processAskOllama(quest, context);
            }
            case "GEMINI" : 
            default : { //otherwise GEMINI
                return await this.processAskGemini(quest, context);
            }
        }   
    }

    public async processAskGemini(quest: QuestInfo | string, context?: KnContextInfo) : Promise<InquiryInfo> {
        if(typeof quest == "string") quest = { question: quest, category: "AIDB", mime: "", image: "", agent: "", model:""};
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        try {
            const aimodel = this.getAIModel(context);
            let input = quest.question;
            let prmutil = new PromptUtility();
            let prompt = prmutil.createAskPrompt(input);
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

    public async processAskOllama(quest: QuestInfo | string, context?: KnContextInfo) : Promise<InquiryInfo> {
        if(typeof quest == "string") quest = { question: quest, category: "AIDB", mime: "", image: "", agent: "", model:""};
        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        try {
            let input = quest.question;            
            let prmutil = new PromptOLlamaUtility();
            let prompt = prmutil.createAskPrompt(input);
            //const ollama = new Ollama({ host: API_OLLAMA_HOST })
            // const result = await ollama.generate({
            //     model: quest.model!,
            //     keep_alive: API_OLLAMA_TIMEOUT,
            //     prompt: prompt,
            //     stream: false,
            // })
            let result = await ollamaGenerate(prompt, quest.model!);
            let response = result.response;
            this.logger.debug(this.constructor.name+".processAsk: response:", response);
            info.answer = this.parseAnswer(response);
            
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            info.error = true;
            info.answer = this.getDBError(ex).message;
        }
        this.logger.debug(this.constructor.name+".processAsk: return:",JSON.stringify(info));
        return info;
    }

    public async processReset(category: string) : Promise<InquiryInfo> {
        return Promise.resolve({ error: false, question: "reset", query: category, answer: "OK", dataset: [] });
    }

    public isValidQuery(sql: string, info: InquiryInfo) : boolean {
        if(sql.trim().length == 0) {
            info.error = true;
            info.answer = "No SQL found in the response.";
            return false;
        }
        if(QuestionUtility.hasIntensiveQuery(sql)) {
            info.error = true;
            info.answer = "Intensive query not allow.";
            return false;            
        }
        return true;
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

    public async getForumConfig(db: KnDBConnector, category: string,context?: KnContextInfo) : Promise<ForumConfig> {
        let handler = new ForumHandler();
        let result = await handler.getForumConfig(db,category,context);
        if(!result) {
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
        }
        return result;
    }

    public async processAPI(sql: string, forum: ForumConfig) : Promise<KnRecordSet> {
        if(forum.api && forum.api.trim().length>0) {
            return this.requestAPI(sql, forum);
        }
        return Promise.reject(new VerifyError("API setting not found",HTTP.NOT_FOUND,-16004));
    }

    protected async requestAPI(sql: string, forum: ForumConfig) : Promise<KnRecordSet> {
        let response;
        let body = JSON.stringify({ query: sql });
        let url = forum.api as string;
        let params = {};
        let settings = {};
        if(forum.setting && forum.setting.trim().length>0) {
            try { 
                settings = JSON.parse(forum.setting);
            } catch(ex) { settings = {}; }
        }
        this.logger.debug(this.constructor.name+".requestAPI: fetch : url=",url," body=",body," settings=",settings);
        try {
            response = await fetch(url, Object.assign(Object.assign({}, params), { method: "POST", headers: {
                    "Content-Type": "application/json", ...settings
                }, body }));
            if (!response.ok) {
                let msg = "Response error";
                try {
                    const json = await response.json();
                    this.logger.debug(this.constructor.name+".requestAPI: response not ok:",json);
                    if(json.head.errordesc) {
                        msg = json.head.errordesc as string;
                    }
                } catch (e) { }                
                this.logger.error(this.constructor.name+".requestAPI: response error:",msg);
                throw new Error(`[${response.status}] ${msg}`);
            }
            try {
                const json = await response.json();
                if("Y"==json.head.errorflag || "1"==json.head.errorflag) {
                    throw new Error(json.head.errordesc as string);
                }
                return json.body as KnRecordSet;
            } catch (e) { }
        } catch (ex: any) {
            this.logger.error(this.constructor.name+".requestAPI: error:",ex);
            return Promise.reject(new VerifyError(ex.message,HTTP.INTERNAL_SERVER_ERROR,-11102));
        } 
        return { records: 0, rows: [], columns: [] };       
    }

    public async getHistory(category: string) : Promise<any[]>{
        return Promise.resolve([]);
    }

    public async doHistory(context: KnContextInfo, model: KnModel) : Promise<any> {
        await this.validateInputFields(context, model, "query");
        let query = context.params.query;
        if(query && query.trim().length>0) {
            return this.getHistory(context.params.query);
        }
        return [];
    }
    
}
