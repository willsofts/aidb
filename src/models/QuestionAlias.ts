import { KnDBConfig } from "@willsofts/will-sql";

export interface QuestInfo {
    question: string;
    mime: string;
    image: string;
    category?: string;
    agent?: string;
    model?: string;
}

export interface InquiryInfo {
    error: boolean;
    question: string;
    query: string;
    answer: string;
    dataset: any;
}

export interface ForumConfig extends KnDBConfig {
    caption: string; //forumtitle
    title: string; //dialecttitle
    type: string; //forumtype
    tableinfo: string; //forumtable
    api?: string; //forumapi
    setting?: string; //forumsetting
    prompt?: string; //forumprompt
    version?: string; //forumdbversion
}

export interface ImageInfo {
    image: string;
    mime: string;
}

export interface InlineData {
    mimeType: string;
    data: string;
}

export interface InlineImage {
    inlineData: InlineData;
}

export interface FileImageInfo extends ImageInfo {
    file: string;
    source: string;
}
