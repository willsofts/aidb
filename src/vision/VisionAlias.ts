import { google } from "@google-cloud/vision/build/protos/protos";

export interface AxisInfo {
    x: number;
    y: number;
}

export interface BoxInfo extends AxisInfo {
    width: number;
    height: number;
}

export interface BlockInfo extends BoxInfo {
    block: google.cloud.vision.v1.IBlock;
    symbol?: google.cloud.vision.v1.ISymbol;
}

export interface WordInfo extends BoxInfo {
    word: google.cloud.vision.v1.IWord;
}

export interface BoundInfo extends BoxInfo {
    bounding: boolean;
}

export interface PageInfo {
    pages: google.cloud.vision.v1.IPage[];
    text: string;
}

export interface InlineInfo {
    axis: AxisInfo;
    blocks: BlockInfo[];
    texts: string[];
}

export interface LinearInfo {
    first: AxisInfo;
    second: AxisInfo;
    slope: number;
    arctan: number;
    degree: number;
}

export interface LabelInfo {
    code: string;
    labels: string[];
    type?: string;
    lines?: number;
    value?: string|null;
    correct?: boolean;
    correctValue?: string|null;
    correctPrompt?: string|null;
}

export interface TextInfo {
    docid: string;
    doctitle: string;
    captions: LabelInfo[];
}

export interface TrialInfo {
    matched: boolean;
    index: number;
    code: string;
    label: string;
    pretext: string;
    text: string;
    posttext: string;
    needed: boolean;
}

export interface RotateInfo {
    rotated: boolean;
    degree: number;
    buffer?: Buffer;
}
