import { KnDBConfig } from "@willsofts/will-sql";

export interface InquiryInfo {
    error: boolean;
    question: string;
    query: string;
    answer: string;
    dataset: any;
}

export interface ForumConfig extends KnDBConfig {
    title: string; //dialecttitle
    type: string; //forumtype
    tableinfo: string; //forumtable
    api?: string; //forumapi
    setting?: string; //forumsetting
    prompt?: string; //forumprompt
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
