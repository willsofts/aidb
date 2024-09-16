import fs from 'fs';
import axios from 'axios';
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let url = Arguments.getString(args,'http://localhost:8080/api/chatimage/ask','-url');
let file = Arguments.getString(args,'./images/po.jpg','-file');
let mime = Arguments.getString(args,'image/jpeg','-mime');
let category = Arguments.getString(args,'MY-KEY','-cat','-key');
let query = Arguments.getString(args,'Summarize text from information','-qry','-quest');
if(file && file.trim().length && url && mime && category && query) {
    let stream = undefined;
    let existing = fs.existsSync(file);
    if(existing) {
        let buffer = fs.readFileSync(file, {flag:'r'});
        stream = buffer.toString("base64");
    }
    if(stream) {
        askImage(url,category,query,mime,stream);
    }
}
function askImage(url:string, key: string, query:string, mime:string, image:string) {
    let config = { 
        headers: {
            'Content-Type': 'application/json',
        }
    };
    let data = {
        category: key,
        query: query,
        mime: mime,
        image: image
    };
    axios.post(url, data, config).then((res: any) => {
        console.log("response",res);
        console.log("response data",JSON.stringify(res.data));
    }).catch(function (error: any) {
        console.log(error);
    });
}
