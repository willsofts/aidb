import { DetectHandler } from "../question/DetectHandler";
import { Arguments } from "@willsofts/will-util";

const args = process.argv.slice(2);
const input = Arguments.getString(args,"Summarize text from info","-input") as string;
const mime = Arguments.getString(args,"PDF","-mime") as string;
const file = Arguments.getString(args,"./pdf/MyPO.pdf","-file") as string;
const handler = new DetectHandler();
handler.processQuestion({question: input, mime: mime, image: file}).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
