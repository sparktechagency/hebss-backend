// import fs from 'fs';
// import path from 'path';
// import { FileArray, UploadedFile } from 'express-fileupload';
// import CustomError from '../app/errors';
// import config from '../config';

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


import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { UploadedFile } from 'express-fileupload'
import CustomError from '../app/errors'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
})

type FileMap = {
  [key: string]: UploadedFile | UploadedFile[]
}

const fileUploader = async (
  files: FileMap,
  directory: string,
  imageName: string
): Promise<string | string[]> => {
  if (!files || Object.keys(files).length === 0) {
    throw new CustomError.BadRequestError('No files were uploaded!')
  }

  const uploadToCloudinary = (file: UploadedFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `uploads/${directory}` },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary Upload Error:', error)
            reject(new CustomError.BadRequestError(error?.message || 'Upload failed'))
          } else {
            resolve(result.secure_url)
          }
        }
      )
      stream.end(file.data)
    })
  }

  const fileData = files[imageName]

  if (!Array.isArray(fileData)) {
    return await uploadToCloudinary(fileData)
  } else if (fileData.length > 0) {
    const uploadPromises = fileData.map(file => uploadToCloudinary(file))
    return await Promise.all(uploadPromises)
  } else {
    throw new CustomError.BadRequestError('Invalid file format!')
  }
}

export default fileUploader

