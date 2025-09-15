import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

export const fileValidation = {
  image: ['image/jpeg', 'image/png', 'image/gif'],
  document: ['application/pdf', 'application/msword']
};

export const localFileUpload = ({ customPath = "general", validation = [] } = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${basePath}`);
      
     
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      callback(null, fullPath);
    },
    filename: function (req, file, callback) {
      const uniqueFileName = Date.now() + "__" + Math.random() + "__" + file.originalname;
      callback(null, uniqueFileName);
    }
  });

  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new Error("Invalid file format"), false);
  };

  return multer({ storage, fileFilter }); 
};



export const resizeImage = (sizes = { small: 300, medium: 500, large: 800 }) => {
  return async (req, res, next) => {
    try {
      if (!req.file) return next();

      // لو المستخدم محددش حجم، استخدم medium كافتراضي
      const selectedSize = req.body.size || 'medium';
      const width = sizes[selectedSize] || sizes.medium;

      const ext = path.extname(req.file.filename);
      const filenameWithoutExt = path.basename(req.file.filename, ext);
      const resizedFilename = `${filenameWithoutExt}_resized${ext}`;

      const resizedPath = path.join(path.dirname(req.file.path), resizedFilename);

      await sharp(req.file.path)
        .resize({ width })
        .toFile(resizedPath);

      // احذف الملف الأصلي بعد التعديل (اختياري)
      fs.unlinkSync(req.file.path);

      // حدّث بيانات الملف في req.file
      req.file.filename = resizedFilename;
      req.file.path = resizedPath;

      next();
    } catch (err) {
      console.error("Error resizing image:", err);
      next(err);
    }
  };
};
