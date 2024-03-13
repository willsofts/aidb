export class PromptUtility {
    public readonly dialect : string = "MySQL";

    constructor(dialect?: string) {
        if(dialect) {
            this.dialect = dialect;
        }
    }

    public createQueryPrompt(input: string,table_info: string, dialect: string = this.dialect) : string {
        return `Given an input question, first create a syntactically correct ${dialect} query to run return as the answer.
        Use the following format:
        
        Question: "Question here"
        Answer: "SQL Query to run with plain text in double quotes"
        
        Only use the following tables:
        
        ${table_info}
                
        Always using alias's name or table's name in the SELECT clause and avoid field list is ambiguous.
        If someone asks for the table foobar, they really mean the product table.
                
        Question: ${input}`;
    }
    
    public createQuestPrompt(input: string, rs: string, sql: string, table_info: string, dialect: string = this.dialect) : string {
        return `Given an input question, then look at the results of the query and return the answer.
        Use the following format:
        
        Question: "Question here"
        SQLResult: "Result of the SQLQuery"
        Answer: "Final answer here"
                
        If result not found then return No result.
        
        Question: ${input}
        SQLResult: ${rs}
        `;
    }
       
}