import { Utilities } from "@willsofts/will-util";

const ANSWER_PROMPT_INFO_ = `If result not found then return No result.
        When the question ask about the object, use the object name not object id.`;
const ANSWER_PROMPT_INFO = `If result not found then return blank.`;
        
const DATABASE_VERSION_INFO = "Using Database version: ";

export class PromptOLlamaUtility {
    public readonly dialect : string = "MySQL";

    constructor(dialect?: string) {
        if(dialect) {
            this.dialect = dialect;
        }
    }

    public getCurrentDate() : string {
        let now = new Date();
        let current_date = now.toLocaleDateString("th-TH",{year: "numeric", month:"long", day:"numeric", weekday: "long"});
        return Utilities.currentDate(now) + " ("+ Utilities.getFormatWeekDate(now,Utilities.LONG," ",Utilities.INTER)+" : "+current_date+")";
    }

    public createChatPrompt(category: string, input: string, table_info: string, version: string, dialect: string = this.dialect) : string {
        let current_date = this.getCurrentDate();
        let current_version = version.trim().length>0 ? DATABASE_VERSION_INFO + version : "";

        // 4 th 
        // return `You are a ${dialect} (version ${version}) Database administrator. 
        // You must answer with only 1 best syntactically correct SQL query statement in ${dialect} version ${version}. 
        // Use the following format (without any explaination):

        // Question: "Question here"
        // Answer: "SQL Query to run with plain text in double quotes"
        
        // The fields you answer must only declared in following tables:

        // ${table_info}

        
        // `;
        return `You are a ${dialect} (version ${version}) Database administrator. 
        You must answer with only 1 best syntactically correct SQL query statement in ${dialect} version ${version}. 
        Use the following format (without any explaination):

        Question: "Question here"
        Answer: "SQL Query to run with plain text in double quotes"

        ${current_version}
        The fields you answer must only declared in following tables:

        ${table_info}

        current date or today is ${current_date}.

        Ask in Thai answer with Thai, Ask in English answer with English
        `;
    }

    public createChatPrompt_ori(input: string, table_info: string, version: string, dialect: string = this.dialect) : string {
        let current_date = this.getCurrentDate();
        let current_version = version.trim().length>0 ? DATABASE_VERSION_INFO + version : "";
        // v.0 ori
        return `Given an input question, first create a syntactically correct ${dialect} query to run return as the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "SQL Query to run with plain text in double quotes without \\ and \\" "
        
        ${current_version}
        Only use the following tables:
        
        ${table_info}
                
        Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
        If someone asks for the table foobar, they really mean the product table. 
        For additional information, the current date or today is ${current_date}.
                
        `;
    }

    public createQueryPrompt(input: string, table_info: string, version: string, dialect: string = this.dialect) : string {
        let current_date = this.getCurrentDate();
        let current_version = version.trim().length>0 ? DATABASE_VERSION_INFO + version : "";
        return `Given an input question, first create a syntactically correct ${dialect} query to run return as the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "SQL Query to run with plain text in double quotes"
        
        ${current_version}
        Only use the following tables:
        
        ${table_info}
                
        Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
        If someone asks for the table foobar, they really mean the product table.
        For additional information, the current date or today is ${current_date}.
                
        Question: ${input}`;
    }
    
    public createAnswerPrompt(input: string, rs: string, prompt_info: string | undefined = undefined) : string {
        if(!prompt_info || prompt_info.trim().length==0) prompt_info = ANSWER_PROMPT_INFO;

        // v.7
        return `Use the result of running the query as the answer (without any explaination) and format the sentence as follows:

        Question: "Question"
        Answer: "Answer"

        ${prompt_info}
                        
        Question: ${input}
        SQLResult: ${rs}
        
        `;
    }
       
    public createAskPrompt(input: string) : string {
        let current_date = this.getCurrentDate();
        return `Given an input question then return the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "An answer in double quotes"
        
        For additional information, the current date or today is ${current_date}.

        Question: ${input}`;
    }

    public createCorrectPrompt(input: string, prompt_info: string|null|undefined = "") : string {
        if(!prompt_info || prompt_info==null) prompt_info = "";
        input = input.replace(/\r?\n|\r/g, " ");
        return `Please correct the following message below and answer in plain text with in format:
        
        Message: "Information here"
        Answer: "An answer in double quotes"
        
        In case of Thai message, please answer in Thai message too.

        ${prompt_info}

        Message: ${input}`;
    }

    public createDocumentPrompt(input: string, document_info: string, prompt_info: string|null|undefined = "") : string {
        if(!prompt_info || prompt_info==null) prompt_info = "";
        let current_date = this.getCurrentDate();
        return `Given an input question then return the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "An answer in double quotes"
        
        Using only the following information to answer.
        For additional information, the current date or today is ${current_date}.
        
        ${document_info}

        ${prompt_info}

        Question: ${input}`;
    }
    
    public createChatDocumentPrompt(document_info: string, prompt_info: string|null|undefined = "") : string {
        if(!prompt_info || prompt_info==null) prompt_info = "";
        let current_date = this.getCurrentDate();
        
        return `

        ${document_info}

        
        ${prompt_info}
        `;
    }

    public createCleansingPrompt(text: string, input: string = "ทำข้อมูลดังต่อไปนี้ให้ถูกต้องสามารถอ่านเข้าใจ") : string {
        
        return `${input}.
    
        ${text}
        `;
    }
}