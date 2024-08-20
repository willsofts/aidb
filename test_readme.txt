For Gemini: set API_KEY=AIzaSyDB3AjxSvK54EbngBB95_3xAIQucGctAGc
For Claude: setx ANTHROPIC_API_KEY "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"
For more info about Claude, please visit: https://docs.anthropic.com/en/docs/quickstart

curl -X POST http://localhost:8080/api/question/quest -d "query=Find out best seller of 5 products in March,2024 ?"
curl -X POST http://localhost:8080/api/inquiry/inquire -d "query=select * from cust_product"
curl -X POST http://localhost:8080/api/question/ask -d "query=List best 10 actors in 2021 ?"

Product Selling: 
List all product name and price order by price descending
List product with name and price then order by price descending
What is the cheapest product name
What is the most expensive product name
Find out best seller 5 product's name of unit in March,2024
Find out top 5 customer's name of order amount in March,2024

Course Training:
What is the cheapest course name from training schedule
What is the most expensive course name from training schedule
List all course name and cost from training schedule
Find out registered trainee's name in March,2024
Find out top most training days from training schedule

Vision:
curl -X POST http://localhost:8080/api/vision/ask -d "image=3ed56d2c-ff93-4b41-a9ee-548db3a31b70&query=Extract text from image"
curl -X POST http://localhost:8080/api/vision/quest -d "query=Extract text from image&image=image-data-base64"

Google Vision API:
1. Create a service account with the roles your application needs, and a key for that service account, 
by following the instructions in Creating a service account key.
2. Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the JSON file that contains your credentials
set GOOGLE_APPLICATION_CREDENTIALS=KEY_PATH_TO_JSON_FILE
ex.
set GOOGLE_APPLICATION_CREDENTIALS=D:\AI\key\service_account_key.json

