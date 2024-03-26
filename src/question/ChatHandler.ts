import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from "@willsofts/will-core";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY, API_MODEL, API_ANSWER } from "../utils/EnvironmentVariable";
import { PromptUtility } from "./PromptUtility";
import { InquiryInfo, QuestionHandler } from "./QuestionHandler";

const genAI = new GoogleGenerativeAI(API_KEY);
const chatmap = new Map<String,ChatSession>();

export class ChatHandler extends QuestionHandler {

    public progid = "chat";
    public model : KnModel = { 
        name: "tchat", 
        alias: { privateAlias: this.section }, 
    };

    public getChatHistory(category: string, table_info: string) {
        let prmutil = new PromptUtility();
        let prompt = prmutil.createChatPrompt("", table_info);
        return [
            {
                role: "user",
                parts: prompt,
            },
            {
                role: "model",
                parts: "Great to meet you. What would you like to know?",
            },
        ];
    }

    public async processQuest(context: KnContextInfo, question: string, category: string = "AIDB", model: KnModel = this.model) : Promise<InquiryInfo> {
        let info = { error: false, question: question, query: "", answer: "", dataset: [] };
        if(!question || question.length == 0) {
            info.error = true;
            info.answer = "No question found.";
            return Promise.resolve(info);
        }
        const aimodel = genAI.getGenerativeModel({ model: API_MODEL,  generationConfig: { temperature: 0 }});
        let input = question;
        let db = this.getPrivateConnector(model);
        try {
            let forum = await this.getForumConfig(context,db,category);
            this.logger.debug(this.constructor.name+".processQuest: forum:",forum);
            this.logger.debug(this.constructor.name+".processQuest: input:",input);
            this.logger.debug(this.constructor.name+".processQuest: category:",category);
            this.logger.debug(this.constructor.name+".processQuest: chatmap.size:",chatmap.size);
            let table_info = forum.tableinfo;
            let chat = chatmap.get(category);
            if(!chat) {
                let history = this.getChatHistory(category, table_info);
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
            this.logger.debug(this.constructor.name+".processQuest: response:",text);
            let hischat = await chat.getHistory();
            this.logger.debug(this.constructor.name+".processQuest: history.length:",hischat?hischat.length:0);
            //try to extract SQL from the response
            let sql = this.parseAnswer(text,true);
            this.logger.debug(this.constructor.name+".processQuest: sql:",sql);
            if(!this.isValidQuery(sql,info)) {
                return Promise.resolve(info);
            }
            info.query = sql;
            //then run the SQL query
            let rs = await this.doEnquiry(sql, forum);
            this.logger.debug(this.constructor.name+".processQuest: rs:",rs);
            if(rs.records == 0) {
                info.answer = "Record not found.";
                return Promise.resolve(info);
            }
            info.dataset = rs.rows;
            if(API_ANSWER) {
                let datarows = JSON.stringify(rs.rows);
                this.logger.debug(this.constructor.name+".processQuest: SQLResult:",datarows);
                //create reply prompt from sql and result set
                let prmutil = new PromptUtility();
                let prompt = prmutil.createAnswerPrompt(input, datarows, sql, "");
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
            let chat = chatmap.get(category);
            if(chat) {
                this.sendError(chat,info.answer);
            }
        }
        this.logger.debug(this.constructor.name+".processQuest: return:",JSON.stringify(info));
        return info;
    }

    public sendError(chat: ChatSession, errmsg: string) {
        let msg = "Question: "+errmsg;
        chat.sendMessage(msg).then((msg: any) => { 
            this.logger.info(this.constructor.name+".sendError",msg); 
        }).catch((ex: any) => { 
            this.logger.error(this.constructor.name+".sendError",ex); 
        });
    }

}
