"use strict";
// import fs from 'fs';
// import path from 'path';
// import { FileArray, UploadedFile } from 'express-fileupload';
// import CustomError from '../app/errors';
// import config from '../config';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface FileUploader {
//   (files: FileArray, directory: string, imageName: string): Promise<string | string[]>;
// }
// const fileUploader: FileUploader = async (files, directory, imageName) => {
//   // check the file
//   if (!files || Object.keys(files).length === 0) {
//     throw new CustomError.NotFoundError('No files were uploaded!');
//   }
//   const folderPath = path.join('uploads', directory);
//   // Ensure the directory exists, if not, create it
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }
//   // check one image or two image
//   if (!Array.isArray(files[imageName])) {
//     const file = files[imageName] as UploadedFile;
//     const fileName = file.name;
//     const filePath = path.join(folderPath, fileName);
//     await file.mv(filePath);
//     return `${config.server_url}/v1/${filePath}`;
//   } else if (files[imageName].length > 0) {
//     // Handle multiple file uploads
//     const filePaths: string[] = [];
//     for (const item of files[imageName] as UploadedFile[]) {
//       const fileName = item.name;
//       const filePath = path.join(folderPath, fileName);
//       await item.mv(filePath);
//       filePaths.push(`${config.server_url}/v1/${filePath}`); // Collect all file paths
//     }
//     return filePaths;
//   } else {
//     throw new CustomError.BadRequestError('Invalid file format!');
//   }
// };
// export default fileUploader;
const cloudinary_1 = require("cloudinary");
const errors_1 = __importDefault(require("../app/errors"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});
const fileUploader = (files, directory, imageName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!files || Object.keys(files).length === 0) {
        throw new errors_1.default.BadRequestError('No files were uploaded!');
    }
    const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder: `uploads/${directory}` }, (error, result) => {
                if (error || !result) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(new errors_1.default.BadRequestError((error === null || error === void 0 ? void 0 : error.message) || 'Upload failed'));
                }
                else {
                    resolve(result.secure_url);
                }
            });
            stream.end(file.data);
        });
    };
    const fileData = files[imageName];
    if (!Array.isArray(fileData)) {
        return yield uploadToCloudinary(fileData);
    }
    else if (fileData.length > 0) {
        const uploadPromises = fileData.map(file => uploadToCloudinary(file));
        return yield Promise.all(uploadPromises);
    }
    else {
        throw new errors_1.default.BadRequestError('Invalid file format!');
    }
});
exports.default = fileUploader;
