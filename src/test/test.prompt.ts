import { PromptUtility } from "../question/PromptUtility";

let prompt = new PromptUtility();
let chat = prompt.createChatPrompt("select * from tdialect","table_info","");
console.log("chat:",chat);
let query = prompt.createQueryPrompt("select * from tdialect","table_info","");
console.log("query:",query);
let answer = prompt.createAnswerPrompt("select * from tdialect","rs");
console.log("answer:",answer);
let ask = prompt.createAskPrompt("select * from tdialect");
console.log("ask:",ask);
let correct = prompt.createCorrectPrompt("select * from tdialect",null);
console.log("correct:",correct);
