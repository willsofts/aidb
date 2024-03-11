import config from "@willsofts/will-util";

export const DB_SECTION: string = config.env("DB_SECTION","MYSQL");
export const API_KEY: string = config.env("API_KEY","");
export const API_MODEL: string = config.env("API_MODEL","gemini-pro");
