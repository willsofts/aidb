import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
interface TextContentBlock {
    text: string;
}

export async function claudeProcess(system_prompt: string, question: string): Promise<any> {
    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
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



