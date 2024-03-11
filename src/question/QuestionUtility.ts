import fs from 'fs';
import path from 'path';

export class QuestionUtility {

    public static parseAnswer(answer: string, defaultAnswer: boolean = true) : string {
        answer = answer.trim();
        let idx = answer.indexOf("Answer:");
        if(idx >= 0) {
            let sql = answer.substring(idx+7);
            sql = sql.trim();
            if(sql.startsWith("\"")) {
                sql = sql.substring(1,sql.length-1);
            }
            if(sql.endsWith("\"")) {
                sql = sql.substring(0,sql.length-1);
            }
            idx = sql.indexOf("```sql");
            if(idx>=0) {
                sql = sql.substring(idx+6);
            }
            idx = sql.indexOf("```");
            if(idx>=0) {
                sql = sql.substring(0,idx);
            }
            return sql.trim();
        }
        return defaultAnswer?answer:"";
    }

    public static readDatabaseFileInfo(schemafile: string = "aidb_schema.sql", curDir?: string) : string {
        try {
            if(!curDir) curDir = process.cwd();
            let filepath = path.join(curDir,'database')
            let filename = path.resolve(filepath,schemafile);
            let filedata = fs.readFileSync(filename,'utf-8');
            return filedata;
        } catch(ex) {
            console.error(ex);
        }
        return "";
    }
    
    public static getDatabaseSchemaFile(category: string | undefined) : string {
        if(category && category.trim().length > 0) {
            let filename = category.toLowerCase()+"_schema.sql";
            let fullfilename = path.join(process.cwd(),'database',filename);
            if(fs.existsSync(fullfilename)) {
                return filename;
            }
        }
        return "aidb_schema.sql";
    }

}