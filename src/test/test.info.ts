import { QuestionHandler } from "../question/QuestionHandler";

const handler = new QuestionHandler();
let tableinfo = handler.getDatabaseTableInfo();
console.log("Table Info:",tableinfo);
let answer = "Answer: \"SELECT \"Name\" FROM \"Genre\" WHERE substr(\"Name\", 1, 1)='r';\"";
let sql = handler.parseAnswer(answer);
console.log("SQL:",sql);
