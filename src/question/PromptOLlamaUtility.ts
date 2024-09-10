import { Utilities } from "@willsofts/will-util";

const ANSWER_PROMPT_INFO = `If result not found then return No result.
        When the question ask about the object, use the object name not object id.`;
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
            case "AIDB1_bk": 
                    return `You are Mysql Database adminstrator maintaining 4 tables with schema is 

                    TABLE 1 'cust_info' ('customer_id' varchar(50), 'customer_name' varchar(50), 'customer_surname' varchar(50), PRIMARY KEY ('customer_id'));
                    TABLE 2 'cust_order' ('order_id' varchar(50), 'customer_id' varchar(50), 'order_date' date, 'order_time' time, 'order_status' varchar(50), 'order_total_unit' bigint, 'order_total_amount', PRIMARY KEY ('order_id','customer_id') USING BTREE) ;
                    TABLE 3 'cust_order_detail' ('order_id' varchar(50), 'product_id' varchar(50), 'order_date' date, 'order_time' time, 'order_unit' bigint, 'order_price' decimal(20,2), 'order_discount' decimal(20,2), 'order_amount' decimal(20,2), PRIMARY KEY ('order_id','product_id')) ;
                    TABLE 4 'cust_product' ('product_id' varchar(50), 'product_name' varchar(50), 'product_price' decimal(16,2), 'product_index' int, PRIMARY KEY ('product_id') USING BTREE) 
                    Use the following tables relationship: cust_order.customer_id = cust_info.customer_id, cust_order_detail.order_id = cust_order.order_id, cust_order_detail.product_id = cust_product.product_id 

                    Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
                    If someone asks for the table foobar, they really mean the product table. 
                    Must not provide examples. or use euphemistic words.
                    For additional information, the current date or today is ${current_date}.
                            
                    `;
            break;

            case "AIDB1": 
            
                    // work
                    // 1 
                    // return `You are Mysql Database adminstrator maintaining 4 tables with schema is 

                    // 3 
                    // return `
                    // You are the ${dialect} Database Administrator who alway answer a query with correct syntax in ${dialect}. 
                    // The query that retrive data according to the input question.
                    // There are 4 tables to take care is

                    // 2 ok 
                    // //work but -> return `You are ${dialect} Database adminstrator who always answer a syntactically correct ${dialect} query.
                    // //return `You are ${dialect} Database adminstrator. Only answer a syntactically correct ${dialect} query to run return as the answer.

                    // return `You are ${dialect} Database adminstrator. Only answer a syntactically correct ${dialect} query.
                    
                    // Maintaining 4 tables with schema is 

                    // ${table_info}

                    // Always using alias name or full table name within columns in query statement and avoid field list is ambiguous.
                    // If someone asks for the table foobar, they really mean the product table. 
                    // Must not provide examples. or use euphemistic words.
                    // For additional information, the current date or today is ${current_date}.
                            
                    // `;

                    

                    
                    // 4 th
                    return `คุณเป็น ${dialect} Database adminstrator. ต้องตอบคำถามกลับมาเป็น ${dialect} query ที่ถูกไวยากรณ์และนำไปใช้รันได้

                    ${current_version}
                    
                    ฟิลด์ข้อมูลที่ตอบจะต้องตรงตาม schema ดังนี้

                    ${table_info}
           
                    `;

            break;

            case "AIDB2":
                    // 4 th
                    return `คุณเป็น ${dialect} Database adminstrator. ต้องตอบคำถามกลับมาเป็น ${dialect} query ที่ถูกไวยากรณ์และนำไปใช้รันได้
                    
                    ${current_version}
                    
                    ฟิลด์ข้อมูลที่ตอบจะต้องตรงตาม schema ดังนี้

                    ${table_info}

                    `;

                    // CREATE TABLE IF NOT EXISTS 'train_course' (
                    //     'course_id' varchar(50) NOT NULL,
                    //     'course_name' varchar(100) NOT NULL,
                    //     PRIMARY KEY ('course_id')
                    //     ) ENGINE=InnoDB COMMENT='table keep course information';

                    //     CREATE TABLE IF NOT EXISTS 'train_register' (
                    //     'schedule_id' varchar(50) NOT NULL COMMENT 'train_schedule.schedule_id',
                    //     'trainee_id' varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'train_trainee.trainee_id',
                    //     'register_date' date NOT NULL,
                    //     'register_time' time NOT NULL,
                    //     'train_amount' decimal(20,2) NOT NULL DEFAULT '0.00',
                    //     PRIMARY KEY ('schedule_id','trainee_id') USING BTREE,
                        
                    //     ) ENGINE=InnoDB COMMENT='table keep training registeration';

                    //     CREATE TABLE IF NOT EXISTS 'train_schedule' (
                    //     'schedule_id' varchar(50) NOT NULL,
                    //     'course_id' varchar(50) NOT NULL COMMENT 'train_course.course_id',
                    //     'trainer_id' varchar(50) NOT NULL COMMENT 'train_trainer.trainer_id',
                    //     'start_date' date NOT NULL,
                    //     'start_time' time NOT NULL,
                    //     'end_date' date NOT NULL,
                    //     'end_time' time NOT NULL,
                    //     'train_days' int NOT NULL DEFAULT (0),
                    //     'train_cost' decimal(20,2) NOT NULL DEFAULT '0.00',
                    //     PRIMARY KEY ('schedule_id'), KEY 'course_id_trainer_id' ('course_id','trainer_id'), KEY 'FK_train_schedule_train_trainer' ('trainer_id'),
                    //     ) ENGINE=InnoDB COMMENT='table keep training scheduler';

                    //     CREATE TABLE IF NOT EXISTS 'train_trainee' (
                    //     'trainee_id' varchar(50) NOT NULL,
                    //     'email' varchar(100) NOT NULL,
                    //     'trainee_name' varchar(100) NOT NULL,
                    //     PRIMARY KEY ('trainee_id'), KEY 'email' ('email')
                    //     ) ENGINE=InnoDB COMMENT='table keep trainee information';

                    //     CREATE TABLE IF NOT EXISTS 'train_trainer' (
                    //     'trainer_id' varchar(50) NOT NULL,
                    //     'trainer_name' varchar(100) NOT NULL,
                    //     PRIMARY KEY ('trainer_id')
                    //     ) ENGINE=InnoDB COMMENT='table keep trainer information';


                    //     Use the following tables relationship:

                    //     train_course.course_id = train_schedule.course_id
                    //     train_register.schedule_id = train_schedule.schedule_id
                    //     train_register.trainee_id = train_trainee.trainee_id
                    //     train_schedule.course_id = train_course.course_id
                    //     train_schedule.trainer_id = train_trainer.trainer_id
            
                    // `;

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
        // v.0 ori
        // return `Given an input question, then look at the results of the query and return the answer.
        // Use the following format:
        
        // Question: "Question here"
        // Answer: "Final answer here"
               
        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        // `;


        // v.1 fail
        // return `Take the values every rows in ${rs} seperated by , then write out as final answer in format 

        // Question: "Question here"
        // Answer: "Final answer here"
               
        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        // `;


        // v.2 fail
        // return `Given an input question, then look at the results of the query and return the answer.
        // Use the following format:
        
        // Question: "Question here"
        // Answer: "Final answer here"
               
        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        // `;


        // v.3 fail
        // return `กำหนดให้ SqlResult มีค่าดังนี้ ${rs} 
        // และ Final answer ให้เอาข้อมูลจากใน SqlResult มาต่อกันโดยคั่นแต่ละข้อมูลด้วยเครื่องหมาย , 
        // และแสดงผลตามรูปแบบดังนี้

        // Question: "Question here"
        // Answer: "Final answer here"

        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        
        // `;


        // v.4 ok
        // return `Use the results of the query and return the answer.
        // Use the following format:

        // Question: "Question here"
        // Answer: "Final answer here"
 
        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        
        // `;

        // v.5 th
        //return `ใช้ผลลัพธ์จากการรัน query เป็นคำตอบ และจัดรูปแบบประโยคดังนี้

        //Question: "แสดงคำถาม"
        //Answer: "ผลจากการรัน query"


        // return `ผลลัพธ์ที่ได้จากการรัน query เป็น final answer และจัดรูปแบบประโยคดังนี้

        // Question: "Question here"
        // Answer: "Final answer here"

        // ${prompt_info}
                        
        // Question: ${input}
        // SQLResult: ${rs}
        
        // `;


        // v.6 th
        return `Use the result of running the query as the answer and format the sentence as follows:

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