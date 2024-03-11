import { QuestionHandler } from "../question/QuestionHandler";

const input = "SELECT product_id, SUM(order_unit) AS total_units_sold FROM cust_order_detail GROUP BY product_id ORDER BY total_units_sold DESC LIMIT 5";
const handler = new QuestionHandler();
handler.doInquiry(input).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
