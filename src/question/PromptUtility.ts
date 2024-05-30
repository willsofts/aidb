import { Utilities } from "@willsofts/will-util";

const ANSWER_PROMPT_INFO = `If result not found then return No result.
        When the question ask about the object, use the object name not object id.`;
const DATABASE_VERSION_INFO = "Using Database version: ";

export class PromptUtility {
    public readonly dialect : string = "MySQL";

    constructor(dialect?: string) {
        if(dialect) {
            this.dialect = dialect;
        }
    }

    public getCurrentDate() : string {
        return Utilities.currentDate() + " ("+ Utilities.getFormatWeekDate(new Date(),Utilities.LONG," ",Utilities.INTER)+")";
    }

    public createChatPrompt(input: string, table_info: string, version: string, dialect: string = this.dialect) : string {
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
        For additional information, using the current date or Today is ${current_date}.
                
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
        For additional information, using the current date or Today is ${current_date}.
                
        Question: ${input}`;
    }
    
    public createAnswerPrompt(input: string, rs: string, prompt_info: string | undefined = undefined) : string {
        if(!prompt_info || prompt_info.trim().length==0) prompt_info = ANSWER_PROMPT_INFO;
        return `Given an input question, then look at the results of the query and return the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "Final answer here"
               
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
        
        For additional information, using the current date or Today is ${current_date}.

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
        For additional information, using the current date or Today is ${current_date}.
        
        ${document_info}

        ${prompt_info}

        Question: ${input}`;
    }

    public createChatDocumentPrompt(document_info: string, prompt_info: string|null|undefined = "") : string {
        if(!prompt_info || prompt_info==null) prompt_info = "";
        let current_date = this.getCurrentDate();
        return `Given an input question then return the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "An answer in double quotes"
        
        Using only the following information to answer the question and reply in Answer format above.

        ${document_info}

        ${prompt_info}
        For additional information, using the current date or Today is ${current_date}.
        `;
    }

}