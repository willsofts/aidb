import config from "@willsofts/will-util";

export const DB_SECTION: string = config.env("DB_SECTION","MYSQL");
export const API_KEY: string = config.env("API_KEY","");
export const API_MODEL: string = config.env("API_MODEL","gemini-pro");
export const API_VISION_MODEL: string = config.env("API_VISION_MODEL","gemini-pro-vision");
export const API_ANSWER: boolean = config.env("API_ANSWER","true") === "true";
export const API_ANSWER_RECORD_NOT_FOUND: boolean = config.env("API_ANSWER_RECORD_NOT_FOUND","false") === "true";
export const ALWAYS_REMOVE_ATTACH: boolean = config.env("ALWAYS_REMOVE_ATTACH","true") === "true";
export const ROTATE_DEGREE_OFFSET: number = parseInt(config.env("ROTATE_DEGREE_OFFSET","2")) || 2;
