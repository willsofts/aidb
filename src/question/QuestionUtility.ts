import fs from 'fs';
import path from 'path';

export class QuestionUtility {

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