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


        switch (category.toLocaleUpperCase())
        {
            case "AIDB1": 
            case "AIDB2":
                    
                    // 4 th 
                    return `You are a ${dialect} (version ${version}) Database administrator. 
                    You must answer with only 1 best syntactically correct SQL query statement in ${dialect} version ${version}. 
                    Use the following format (without any explaination):
        
                    Question: "Question here"
                    Answer: "SQL Query to run with plain text in double quotes"
                    
                    The fields you answer must only declared in following tables:

                    ${table_info}
           
                    `;

            break;

            default: 
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
                            
                    `;
            break;
        }
    }

    public createChatPrompt_ori(input: string, table_info: string, version: string, dialect: string = this.dialect) : string {
        let current_date = this.getCurrentDate();
        let current_version = version.trim().length>0 ? DATABASE_VERSION_INFO + version : "";
        // v.0 ori
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
                
        `;

        // v.1
        // return `Given an input question, first create a syntactically correct ${dialect} query to run return as the answer.
        // Use the following format:
        
        // Question: "Question here"
        // Answer: "Only answer as plain text SQL Query to run in double quotes"
        
        // ${current_version}
        // Only use the following tables:
        
        // ${table_info}
                
        // Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
        // If someone asks for the table foobar, they really mean the product table. 
        // For additional information, the current date or today is ${current_date}.
                
        // `;

        // v.2 fetch fail
        // return `Given an input question, first create a syntactically correct ${dialect} query to run return as the answer.
        // Use the following format:
        
        // Question: "Question here"
        // Answer: "The answer only contains the SQL query in double quotes, The answer without any other explanation and other options."
        
        // ${current_version}
        // Only use the following tables:
        
        // ${table_info}
                
        // Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
        // If someone asks for the table foobar, they really mean the product table. 
        // For additional information, the current date or today is ${current_date}.
                
        // `;
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
        return `Given an input question then return the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "An answer in double quotes"
        
        Using only the following information to answer the question and reply in Answer format above.

        ${document_info}

        ${prompt_info}
        For additional information, the current date or today is ${current_date}.
        `;
    }

    public createCleansingPrompt(text: string, input: string = "Please correct text from info") : string {
        return `${input}.
    
        ${text}
        `;
    }
}