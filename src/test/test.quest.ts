import { QuestionHandler } from "../question/QuestionHandler";

const input = "Find out best seller of 5 products in March,2024 ?";
const handler = new QuestionHandler();
handler.processQuestion({question: input, category: "AIDB1", mime: "", image: ""}).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
