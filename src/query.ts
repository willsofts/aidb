import { Arguments } from "@willsofts/will-util";
import { ForumConfig } from "./models/QuestionAlias";
import { QuestionHandler } from "./question/QuestionHandler";

let cfg : ForumConfig = {
    type: "DB",     
    api: "",
    caption: "Forum",
    title: "Inquiry",
    tableinfo : "",
    schema: "MYDB",
    alias: "mysql2",
    dialect: "mysql",
    url: "",
    user: "root",
    password: "root",
    host: "localhost",
    port: 3306,
    database: "aidb",
    version: "",
};

let args = process.argv.slice(2);
let sql = Arguments.getString(args,"select * from cust_product","-sql","--query") as string;
cfg.schema = Arguments.getString(args,cfg.schema,"-s","--schema") as string;
cfg.type = Arguments.getString(args,cfg.type,"-t","--type") as string;
cfg.api = Arguments.getString(args,cfg.api,"-api","--api") as string;
cfg.url = Arguments.getString(args,cfg.url,"-url","--url") as string;
cfg.alias = Arguments.getString(args,cfg.alias,"-as","--alias") as string;
cfg.dialect = Arguments.getString(args,cfg.dialect,"-d","--dialect") as string;
cfg.user = Arguments.getString(args,cfg.user,"-u","--user") as string;
cfg.password = Arguments.getString(args,cfg.password,"-p","--password") as string;
cfg.host = Arguments.getString(args,cfg.host,"-h","--host") as string;
cfg.port = Arguments.getInteger(args,cfg.port,"-po","--port") as number;
cfg.database = Arguments.getString(args,cfg.database,"-db","--database") as string;
console.log(cfg);
let handler = new QuestionHandler();
handler.doEnquiry(sql,cfg).then((rs) => {
    console.log(rs);
}).catch((ex) => {
    console.error(ex);
});

//node dist/query.js -sql "select * from cust_product" -s MYDB -t DB -as mysql2 -d mysql -u root -p root -h localhost -po 3306 -db aidb