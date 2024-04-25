import { ChatSession } from "@google/generative-ai";

export class ChatRepository {
    private static _instance: ChatRepository;
    private chatmap = new Map<String,ChatSession>();
    constructor() {
        if (!ChatRepository._instance) {
            ChatRepository._instance = this;
        }
        return ChatRepository._instance;
    }
    public static getInstance() : ChatRepository {
        if(!this._instance) this._instance = new ChatRepository();
        return this._instance;;
    }
    public get(category: string) : ChatSession | undefined {
        return this.chatmap.get(category);
    }
    public set(category: string, chat: ChatSession) {
        this.chatmap.set(category, chat);
    }
    public remove(category: string) {
        this.chatmap.delete(category);
    }
    public size() : number {
        return this.chatmap.size;
    }
}
