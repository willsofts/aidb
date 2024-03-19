import { QuestionHandler } from "../question/QuestionHandler";

const input = "List best 10 actors in 2021 ?";
const handler = new QuestionHandler();
handler.processAsk(input).then((result) => {
    console.log("Result:",result);
}).catch((err) => {
    console.error("Error:",err);
});
