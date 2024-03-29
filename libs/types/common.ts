import { Request } from "express";

export interface EnvironmentVariables {
    MYSQL_USER_PASSWORD: string;
    MYSQL_HOST: string;
    MYSQL_USER_NAME: string;
    MYSQL_DB: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT: string;
    PROJECT_ID: string;
    ENV_TYPE?: string;
}

export interface JwtPayload {
    email: string;
}

export interface AuthorizedRequest extends Request {
    payload?: JwtPayload;
}
