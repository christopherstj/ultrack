import { Express } from "express";
import { Multer } from "multer";

export interface UploadMessageData {
    file: Express.Multer.File;
    user: string;
}
