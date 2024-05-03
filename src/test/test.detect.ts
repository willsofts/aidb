import { DetectHandler } from "../question/DetectHandler";
import { Arguments } from "@willsofts/will-util";

const args = process.argv.slice(2);
const input = Arguments.getString(args,"Extract text from pdf.","-input") as string;
const mime = Arguments.getString(args,"PDF","-mime") as string;
const file = Arguments.getString(args,"./pdf/sample_form.pdf","-file") as string;
const handler = new DetectHandler();
handler.processQuestion(input,mime,file).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
