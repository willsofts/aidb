import Anthropic from "@anthropic-ai/sdk";
import { API_MODEL_CLAUDE } from "../utils/EnvironmentVariable";

const anthropic = new Anthropic();
interface TextContentBlock {
    text: string;
}

export async function claudeProcess(system_prompt: string, question: string): Promise<any> {
    const msg = await anthropic.messages.create({
        model: API_MODEL_CLAUDE,
        max_tokens: 1000,
        temperature: 0,
        system: system_prompt,
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": question
                    }
                ]
            }
        ]
    });
    let result = (msg.content[0] as TextContentBlock).text
    return result;
}


