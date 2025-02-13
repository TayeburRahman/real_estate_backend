import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';


const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log(file);
    const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
    return {
      folder: 'real_estate',
      resource_type: fileType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadC = multer({
  storage,
  fileFilter: (req, file, cb) => {

    console.log('uploading', file);
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/avi', 'video/mov'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

export default uploadC;
