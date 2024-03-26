import { QuestionHandler } from "../question/QuestionHandler";

let input = "SELECT product_id, SUM(order_unit) AS total_units_sold FROM cust_order_detail GROUP BY product_id ORDER BY total_units_sold DESC LIMIT 5";
const handler = new QuestionHandler();
handler.doInquiry(input,"AIDB1").then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
input = `
SELECT product_name,SUM(order_unit) AS total_unit
FROM cust_order_detail cod
JOIN cust_order co ON cod.order_id = co.order_id
JOIN cust_product cp ON cod.product_id = cp.product_id
WHERE co.order_date BETWEEN '2024-03-01' AND '2024-03-31'
GROUP BY product_name 
ORDER BY total_unit DESC
LIMIT 5;
`;
handler.doInquiry(input).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
