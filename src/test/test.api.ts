import { QuestionHandler } from "../question/QuestionHandler";
import { ForumConfig } from "../models/QuestionAlias";
import { Arguments } from "@willsofts/will-util";

const args = process.argv.slice(2);
const input = Arguments.getString(args,"select * from tdialect","-input") as string;
const forum : ForumConfig = {
    type: "API",     
    api: "http://localhost:8080/api/inquiry/inquire",
    title: "Inquire",
    tableinfo : "",
    schema: "AIDB",
    alias: "mysql2",
    dialect: "mysql",
    url: "",
    user: "",
    password: "",
    host: "localhost",
    port: 3306,
};
const handler = new QuestionHandler();
handler.processAPI(input,forum).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
