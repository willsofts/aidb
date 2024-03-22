import { QuestionHandler } from "../question/QuestionHandler";

const handler = new QuestionHandler();
let tableinfo = handler.getDatabaseTableInfo();
console.log("Table Info:",tableinfo);
let answer = "Answer: \"SELECT \"Name\" FROM \"Genre\" WHERE substr(\"Name\", 1, 1)='r';\"";
let sql = handler.parseAnswer(answer);
console.log("SQL:",sql);
answer = `Answer: 
\`\`\`sql
SELECT SUBSTRING_INDEX(product_name, '-', 1) AS product_name,
       SUM(order_unit) AS total_units_sold
FROM cust_order_detail cod
JOIN cust_product cp ON cod.product_id = cp.product_id
WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31'
GROUP BY product_name
ORDER BY total_units_sold DESC
LIMIT 5;
\`\`\`
`;
sql = handler.parseAnswer(answer);
console.log("SQL:",sql);
answer = "Answer: \`SELECT \"Name\" FROM \"Genre\" WHERE substr(\"Name\", 1, 1)='r';\`";
sql = handler.parseAnswer(answer);
console.log("SQL:",sql);

let info = { error: false, question: "List all product", query: "", answer: "", dataset: [] };
sql = "SELECT * FROM product";
let valid = handler.isValidQuery(sql,info);
console.log("SQL:",sql,", Valid:",valid);
sql = "DELETE FROM product";
valid = handler.isValidQuery(sql,info);
console.log("SQL:",sql,", Valid:",valid);
sql = "UPDATE product set product_price=0";
valid = handler.isValidQuery(sql,info);
console.log("SQL:",sql,", Valid:",valid);
sql = "DROP table product";
valid = handler.isValidQuery(sql,info);
console.log("SQL:",sql,", Valid:",valid);
