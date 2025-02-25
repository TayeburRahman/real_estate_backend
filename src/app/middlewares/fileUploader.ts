import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';
import ApiError from '../../errors/ApiError';

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = '';

      if (
        file.fieldname === 'cover_image' ||
        file.fieldname === 'profile_image'
      ) {
        uploadPath = 'uploads/images/profile';
      } else if (file.fieldname === 'product_img') {
        uploadPath = 'uploads/images/products';
      } else if (file.fieldname === 'image') {
        uploadPath = 'uploads/images/image';
      } else if (file.fieldname === 'message_img') {
        uploadPath = 'uploads/images/message';
      } else if (file.fieldname === 'video') {
        uploadPath = 'uploads/video';
      } else {
        uploadPath = 'uploads';
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedFieldnames = [
      'image',
      'profile_image',
      'cover_image',
      'product_img',
      'video',
      'thumbnail',
      'video_thumbnail',
      'message_img',
    ];

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'video/mp4',
    ];

    if (!allowedFieldnames.includes(file.fieldname)) {
      return cb(new ApiError(400, 'Invalid fieldname.'));
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Invalid uploaded file type.'));
    }

    cb(null, true);
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: 'image', maxCount: 30 },
    { name: 'product_img', maxCount: 10 },
    { name: 'cover_image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'video_thumbnail', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'message_img', maxCount: 10 },
  ]);

  return upload;
};
