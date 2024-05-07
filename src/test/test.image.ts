import { VisionHandler } from "../question/VisionHandler";
import { Arguments } from "@willsofts/will-util";

const args = process.argv.slice(2);
const input = Arguments.getString(args,"Extract text from image.","-input") as string;
const mime = Arguments.getString(args,"image/png","-mime") as string;
const imgfile = Arguments.getString(args,"MyImage.png","-img") as string;
const handler = new VisionHandler();
const image = handler.getImageData(imgfile);
handler.processQuestion({question: input, mime: mime, image: image}).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
