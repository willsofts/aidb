set API_KEY=AIzaSyDB3AjxSvK54EbngBB95_3xAIQucGctAGc

curl -X POST http://localhost:8080/api/question/quest -d "query=Find out best seller of 5 products in March,2024 ?"
curl -X POST http://localhost:8080/api/inquiry/inquire -d "query=select * from cust_product"

