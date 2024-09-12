import { Ollama } from 'ollama'
import { stringify } from "querystring";
import { PromptOLlamaUtility } from "../question/PromptOLlamaUtility";
import { API_OLLAMA_HOST, API_OLLAMA_TIMEOUT } from "../utils/EnvironmentVariable";

export class OllamaObj{

    private static _instance: OllamaObj;
    private _ollama = new Ollama({ host: API_OLLAMA_HOST })
    
    public static getInstance() : OllamaObj {
        if(!this._instance) this._instance = new OllamaObj();
        return this._instance;;
    }
    constructor() {
        if (!OllamaObj._instance) {
            OllamaObj._instance = this;
        }
        return OllamaObj._instance;
    }
    public ollama() : Ollama | undefined {
        return this._ollama;
    }
}


export async function ollamaChat(systemPrompt: string, userPrompt: string, model: string): Promise<any> {

    try{
        //const ollama = new Ollama({ host: API_OLLAMA_HOST }); //await ollama.chat({
        const response = OllamaObj.getInstance().ollama()?.chat({
        model: model!,
        keep_alive: API_OLLAMA_TIMEOUT,
        messages: [
            { role: 'system', content: JSON.stringify(systemPrompt) },
            { role: 'user', content: userPrompt }],
        })
        return response;
    }
    catch(ex: any) {
        console.log(ex.message);
    }
    
}
export async function ollamaGenerate(prompt: string, model: string): Promise<any> {

    //const ollama = new Ollama({ host: API_OLLAMA_HOST });
    let response = OllamaObj.getInstance().ollama()?.generate({
        model: model!,
        keep_alive: API_OLLAMA_TIMEOUT,
        prompt: prompt,
        stream: false
    })
    return response;
}