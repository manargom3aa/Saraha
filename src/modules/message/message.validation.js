import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";

export const sendMessage = {
  params: joi.object({
    receiverId: generalFields.id.required()
  }).required(),

  body: joi.object({
    content: joi.string().min(2).max(200000)
  }).required(),

  files: joi.array().items(
    joi.object({
      fieldname: generalFields.file.fieldname.valid('attachments').required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype.valid(...fileValidation.image).required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),  
      path: generalFields.file.path.required(),
      size: generalFields.file.size.required(),
    })
  ).min(0).max(2)
};

export const getMessage = {
  params: joi.object({
    userId: generalFields.id.required()
  }).required(),
};
