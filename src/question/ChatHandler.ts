import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { KnDBError, KnRecordSet } from "@willsofts/will-sql";
import { ChatSession } from "@google/generative-ai";
import { API_ANSWER, API_ANSWER_RECORD_NOT_FOUND, API_MODEL_CLAUDE } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { QuestionHandler } from "./QuestionHandler";
import { QuestInfo, InquiryInfo } from "../models/QuestionAlias";
import { ChatRepository } from "./ChatRepository";
import { claudeProcess } from "../claude/generateClaudeSystem";
import { PromptOLlamaUtility } from "./PromptOLlamaUtility";
import { ollamaChat, ollamaGenerate } from "../ollama/generateOllama";

export class ChatHandler extends QuestionHandler {
    public progid = "chat";
    public model : KnModel = { 
        name: "tchat", 
        alias: { privateAlias: this.section }, 
    };

    public static getChatRepository()  {
        return ChatRepository.getInstance();
    }

    public getChatHistory(category: string, table_info: string, version: string) {
        let prmutil = new PromptUtility();
        let prompt = prmutil.createChatPrompt("", table_info, version);
        return [
            {
                role: "user",
                parts: [{text: prompt}],
            },
            {
                role: "model",
                parts: [{text: "Great to meet you. What would you like to know?"}],
            },
        ];
    }

    public getChatHistoryOllama(category: string, table_info: string, version: string) {
        let prmutil = new PromptOLlamaUtility();
        let prompt = prmutil.createChatPrompt(category, "", table_info, version);
        return prompt;
        // return [
        //     {
        //         role: "user",
        //         parts: [{text: prompt}],
        //     },
        // ];
    }

    public override async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        console.log(this.constructor.name+":[PROCESS QUEST]",quest);
        switch (quest.agent?.toLocaleUpperCase()) {            
            case "CLAUDE": {
                return await this.processQuestClaude(context, quest, model);
            }
            case "GEMMA" :
            case "LLAMA" : {
                return await this.processQuestOllama(context, quest, model);
            }
            case "GEMINI" :
            default : { //otherwise GEMINI
                return await this.processQuestGemini(context, quest, model);
            }
        }
    }

    public override async processQuestGemini(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
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
            const chatmap = ChatRepository.getInstance();
            let forum = await this.getForumConfig(db,category,context);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum.tableinfo;
            let chat = chatmap.get(category);
            if(!chat) {
                let version = await this.getDatabaseVersioning(forum);
                let history = this.getChatHistory(category, table_info, version);
                chat = aimodel.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });
                chatmap.set(category,chat);
            }
            let msg = "Question: "+input;
            let result = await chat.sendMessage(msg);
            let response = result.response;
            let text = response.text();
            console.log("text:",text);
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,true);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs : KnRecordSet = { records: 0, rows: [], columns: [] };
            try {
                rs = await this.doEnquiry(sql, forum);
                this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
                if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                    info.answer = "Record not found.";
                    return Promise.resolve(info);
                }
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
                if(ex instanceof KnDBError) {
                    //try again
                    let msg = "Error: "+ex.message;
                    let result = await chat.sendMessage(msg);
                    let response = result.response;
                    let text = response.text();
                    this.logger.debug(this.constructor.name+".processQuest: catch response:",text);
                    let sql = this.parseAnswer(text,true);
                    this.logger.debug(this.constructor.name+".processQuest: catch sql:",sql);
                    if(!sql || sql.trim().length==0) {
                        info.error = true;
                        info.answer = this.getDBError(ex).message;
                        return Promise.resolve(info);    
                    }
                    if(!this.isValidQuery(sql,info)) {
                        return Promise.resolve(info);
                    }
                    info.query = sql;
                    try {
                        rs = await this.doEnquiry(sql, forum);
                        this.logger.debug(this.constructor.name+".processQuest: catch rs:",rs);
                        if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                            info.answer = "Record not found.";
                            return Promise.resolve(info);
                        }
                    } catch(exc: any) {
                        this.logger.error(this.constructor.name,exc);
                        info.error = true;
                        info.answer = this.getDBError(exc).message;
                        this.sendError(chat,info.answer);
                        return Promise.resolve(info);                    
                    }
                } else {
                    info.error = true;
                    info.answer = this.getDBError(ex).message;
                    this.sendError(chat,info.answer);
                    return Promise.resolve(info);
                }
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                let prmutil = new PromptUtility();
                let prompt = prmutil.createAnswerPrompt(input, datarows, forum.prompt);
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

    public override async processQuestClaude(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
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

    public override async processQuestOllama(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
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
        try 
        {
            const chatmap = ChatRepository.getInstance();
            let forum = await this.getForumConfig(db,category,context);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum.tableinfo;            
            let chat = chatmap.get(category);
            //if(!chat) {
            let version = await this.getDatabaseVersioning(forum);
            let history = this.getChatHistoryOllama(category, table_info, version);              
            let response = await ollamaChat(history, input, quest.model!);

            //let msg = "Question: "+input;
            let text = response.message.content;
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,true);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs : KnRecordSet = { records: 0, rows: [], columns: [] };
            try {
                rs = await this.doEnquiry(sql, forum);
                this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
                if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                    info.answer = "Record not found.";
                    return Promise.resolve(info);
                }
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
                info.error = true;
                info.answer = this.getDBError(ex).message;
                //this.sendError(chat,info.answer);
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {                
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                let prmutil = new PromptOLlamaUtility();
                let prompt = prmutil.createAnswerPrompt(input, datarows, forum.prompt);
                let result = await ollamaGenerate(prompt, quest.model!);
                let response = result.response; 
                this.logger.debug(this.constructor.name+".processQuest: response:", response);
                info.answer = this.parseAnswer(response);
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

    public sendError(chat: ChatSession, errmsg: string) {
        let msg = "Error: "+errmsg;
        chat.sendMessage(msg).then((msg: any) => { 
            this.logger.info(this.constructor.name+".sendError",msg); 
        }).catch((ex: any) => { 
            this.logger.error(this.constructor.name+".sendError",ex); 
        });
    }

    public async getHistory(category: string, map?:  Map<String,ChatSession>) : Promise<any[]>{
        let chat = map?map.get(category):ChatRepository.getInstance().get(category); 
        if(chat) {
            return chat.getHistory();
        }
        return Promise.resolve([]);
    }

    public async getDataView(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let history : any = [];
        let query = context.params.query;
        if(query && query.trim().length>0) {
            try {
                history = await this.getHistory(query);
            } catch(ex: any) {
                this.logger.error(this.constructor.name,ex);
            }
        }
        let title = context.params.title || "";
        return this.createDataTable(KnOperation.VIEW, {title: title, history: history}, {}, "question/history");        
    }    

    public override async processReset(category: string) : Promise<InquiryInfo> {
        this.logger.debug(this.constructor.name+".processReset: category:",category);
        const chatmap = ChatRepository.getInstance();
        let chat = chatmap.get(category);
        if(!chat) {
            return Promise.resolve({ error: false, question: category, query: "reset", answer: "Not found", dataset: [] });
        }
        chatmap.remove(category);
        this.logger.debug(this.constructor.name+".processReset: remove category:",category);
        return Promise.resolve({ error: false, question: category, query: "reset", answer: "Reset OK", dataset: [] });
    }

}
