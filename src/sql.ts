import { Arguments } from "@willsofts/will-util";
import { InquiryHandler } from "./question/InquiryHandler";

let args = process.argv.slice(2);
let section = Arguments.getString(args,"AIDB","-ms","--section");
let sql = Arguments.getString(args,"select * from cust_product","-sql","--query") as string;
let handler = new InquiryHandler();
handler.processInquire(sql,section).then((rs) => {
    console.log(rs);
}).catch((ex) => {
    console.error(ex);
});
