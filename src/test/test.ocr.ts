import { OCRHandler } from "../question/OCRHandler";
import { Arguments } from "@willsofts/will-util";

const args = process.argv.slice(2);
const input = Arguments.getString(args,"Extract text from image.","-input") as string;
const mime = Arguments.getString(args,"CARBOOK","-mime") as string;
const imgfile = Arguments.getString(args,"good.jpg","-img") as string;
const handler = new OCRHandler();
const image = handler.getImageData(imgfile);
handler.processQuestion({question: input, mime: mime, image: image}).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
