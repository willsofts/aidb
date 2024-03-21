import fs from 'fs';
import path from 'path';

export class QuestionUtility {

    public static parseAnswer(answer: string, defaultAnswer: boolean = true) : string {
        answer = answer.trim();
        let ans = answer;
        let idx = answer.indexOf("Answer:");
        if(idx >= 0) {
            ans = answer.substring(idx+7);
            ans = ans.trim();
        }
        let hasQuote = ans.startsWith("\"");
        if(hasQuote) {
            ans = ans.substring(1,ans.length-1);
        }
        if(hasQuote && ans.endsWith("\"")) {
            ans = ans.substring(0,ans.length-1);
        }
        idx = ans.indexOf("```sql");
        if(idx>=0) {
            ans = ans.substring(idx+6);
        }
        idx = ans.lastIndexOf("```");
        if(idx>0) {
            ans = ans.substring(0,idx);
        }
        let hasGrave = ans.startsWith("`");
        if(hasGrave) {
            ans = ans.substring(1,ans.length-1);
        }
        if(hasGrave && ans.endsWith("`")) {
            ans = ans.substring(0,ans.length-1);
        }
        return ans.trim();
    }

    public static readDatabaseFileInfo(schemafile: string = "aidb_schema.sql", dbDir: string = "database", curDir?: string) : string {
        try {
            if(!curDir) curDir = process.cwd();
            let filepath = path.join(curDir,dbDir)
            let filename = path.resolve(filepath,schemafile);
            let filedata = fs.readFileSync(filename,'utf-8');
            return filedata;
        } catch(ex) {
            console.error(ex);
        }
        return "";
    }
    
    public static getDatabaseSchemaFile(category: string | undefined, dbDir: string = "database", curDir?: string) : string {
        if(category && category.trim().length > 0) {
            if(!curDir) curDir = process.cwd();
            let filename = category.toLowerCase()+"_schema.sql";
            let fullfilename = path.join(curDir,dbDir,filename);
            if(fs.existsSync(fullfilename)) {
                return filename;
            }
        }
        return "aidb_schema.sql";
    }

    public static getImageData(filename: string, imageDir: string = "images", curDir?: string) : string {
        if(!curDir) curDir = process.cwd();
        let filepath = path.join(curDir,imageDir,filename);
        console.log("getImageData: ",filepath);
        if(fs.existsSync(filepath)) {
            return Buffer.from(fs.readFileSync(filepath)).toString("base64");
        }
        return "";
    }

}