import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from "@willsofts/will-core";
import { KnDBError, KnRecordSet } from "@willsofts/will-sql";
import { ChatSession } from "@google/generative-ai";
import { API_ANSWER, API_ANSWER_RECORD_NOT_FOUND, API_MODEL_CLAUDE, API_OLLAMA_HOST, API_OLLAMA_TIMEOUT } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { QuestionHandler } from "./QuestionHandler";
import { QuestInfo, InquiryInfo } from "../models/QuestionAlias";
import { ChatRepository } from "./ChatRepository";
import { claudeProcess } from "../claude/generateClaudeSystem";
import { Ollama } from 'ollama'
import { stringify } from "querystring";
import { PromptOLlamaUtility } from "./PromptOLlamaUtility";

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
        return [
            {
                role: "user",
                parts: [{text: prompt}],
            },
            // {
            //     role: "model",
            //     parts: [{text: "Great to meet you. What would you like to know?"}],
            // },
        ];
    }

    public override async processQuest(context: KnContextInfo, quest: QuestInfo, model: KnModel = this.model) : Promise<InquiryInfo> {
        
        // if(quest.agent=="GEMINI") {
        //     return await this.processQuestGemini(context, quest, model);
        // } else if (quest.agent=="CLAUDE") {
        //     return await this.processQuestClaude(context, quest, model);
        // }
        // return await this.processQuestGemini(context, quest, model);

        console.log("[PROCESS QUEST]");
        console.log("category: " + quest.category);
        console.log("agent: " + quest.agent);
        console.log("model: " + quest.model);
        console.log("question: " + quest.question);
        switch (quest.agent?.toLocaleUpperCase()) {
            
            case "CLAUDE": {
                return await this.processQuestClaude(context, quest, model);
            }
            case "GEMMA 2" :
            case "LLAMA 3.1" : {
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
        //console.log("[PROCESS QUEST " + model + "]");

        let info = { error: false, question: quest.question, query: "", answer: "", dataset: [] };
        if(!quest.question || quest.question.trim().length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        let category = quest.category;
        if(!category || category.trim().length==0) category = "AIDB";

        //const ollama = new Ollama({ host: 'http://127.0.0.1:12123' })
        const ollama = new Ollama({ host: API_OLLAMA_HOST })
        let input = quest.question;
        let db = this.getPrivateConnector(model);
        try 
        {
            const chatmap = ChatRepository.getInstance();
            let forum = await this.getForumConfig(db,category,context);
            // console.log("-------------------------------------------");
            // console.log("TableInfo: " + forum.tableinfo);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: category:",category+", input:",input);
            let table_info = forum.tableinfo;
            

            let chat = chatmap.get(category);
            //if(!chat) {
            let version = await this.getDatabaseVersioning(forum);
            let history = this.getChatHistoryOllama(category, table_info, version);
              
            // console.log("\n-------------------------------------------");
            // console.log("+[HISTORY]");
            // console.log(JSON.stringify(history[0].parts));
            // console.log("-[HISTORY]");
            // console.log("-------------------------------------------");
            // console.log("\n-------------------------------------------");
            // console.log("+[CHAT BEGIN]")
            let response = await ollama.chat({
                model: quest.model!,
                keep_alive: API_OLLAMA_TIMEOUT,
                messages: [
                    { role: 'system', content: JSON.stringify(JSON.stringify(history[0].parts)) },
                    { role: 'user', content: input }],
            })

            let msg = "Question: "+input;
            let text = response.message.content;
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            // console.log("-[CHAT END]");
            // console.log("-------------------------------------------");
            // console.log("+[RESPONSE BEGIN]");
            // console.log(text);
            // console.log("-[RESPONSE END]");
            // console.log("-------------------------------------------");


            //try to extract SQL from the response
            let sql = this.parseAnswer(text,true);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            // console.log("\n-------------------------------------------");
            // console.log("[SQL BEGIN]");
            // console.log(sql);
            // console.log("[SQL END]");
            // console.log("-------------------------------------------");
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
                // if(ex instanceof KnDBError) {
                //     //try again
                //     //let msg = "Error: "+ex.message;
                //     //let result = await chat.sendMessage(msg);
                //     //let response = result.response;
                //     //let text = response.text();
                //     //this.logger.debug(this.constructor.name+".processQuest: catch response:",text);
                //     //let sql = this.parseAnswer(text,true);
                //     //this.logger.debug(this.constructor.name+".processQuest: catch sql:",sql);
                //     //this.logger.debug(this.constructor.name+".processAsk: response:", response);
                //     //info.answer = this.parseAnswer(response);
                    
                //     let msg = "Error: "+ex.message;
                //     let response = await ollama.chat({
                //         model: quest.model!,
                //         keep_alive: API_OLLAMA_TIMEOUT,
                //         messages: [
                //             //{ role: 'system', content: JSON.stringify(JSON.stringify(history[0].parts)) },
                //             { role: 'user', content: msg }]
                //     })
                    
                //     let text = response.message.content;
                //     this.logger.debug(this.constructor.name+".processQuest: catch response:",text);
                //     let sql = this.parseAnswer(text,true);
                //     this.logger.debug(this.constructor.name+".processQuest: catch sql:",sql);
                //     if(!sql || sql.trim().length==0) {
                //         info.error = true;
                //         info.answer = this.getDBError(ex).message;
                //         return Promise.resolve(info);    
                //     }
                //     if(!this.isValidQuery(sql,info)) {
                //         return Promise.resolve(info);
                //     }
                //     info.query = sql;
                //     try {
                //         rs = await this.doEnquiry(sql, forum);
                //         this.logger.debug(this.constructor.name+".processQuest: catch rs:",rs);
                //         if(rs.records == 0 && API_ANSWER_RECORD_NOT_FOUND) {
                //             info.answer = "Record not found.";
                //             return Promise.resolve(info);
                //         }
                //     } catch(exc: any) {
                //         this.logger.error(this.constructor.name,exc);
                //         info.error = true;
                //         info.answer = this.getDBError(exc).message;
                //         //this.sendError(chat,info.answer);
                //         return Promise.resolve(info);                    
                //     }
                // } else {
                //     info.error = true;
                //     info.answer = this.getDBError(ex).message;
                //     //this.sendError(chat,info.answer);
                //     return Promise.resolve(info);
                // }
                
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
                let result = await ollama.generate({
                    model: quest.model!,
                    keep_alive: API_OLLAMA_TIMEOUT,
                    prompt: prompt,
                    stream: false
                })
                let response = result.response; 
                this.logger.debug(this.constructor.name+".processQuest: response:", response);
                info.answer = this.parseAnswer(response);
                // console.log("\n-------------------------------------------");
                // console.log("[ANSWER BEGIN]");
                // console.log( "\ninput     -> " + input);
                // console.log( "\nf prompt  -> " + forum.prompt);
                // console.log( "\nprompt    -> " + prompt);
                // console.log( "\nresponse  -> " + response);
                // console.log( "\ninfo      -> " + info.answer);
                // console.log("[ANSWER END]");
                // console.log("\n-------------------------------------------");
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
