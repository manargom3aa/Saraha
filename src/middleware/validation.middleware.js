import { asyncHandler } from "../utils/response.js";
import { Types } from "mongoose";
import { genderEnum } from "../DB/models/User.model.js";
import joi from "joi";


export const generalFields = {
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["net", "com", "edu"] },
      }),
       password: joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$")),
       confirmPassword: joi.string().valid(joi.ref("password")),
       phone: joi.string().pattern(new RegExp(/^01[0-2,5]{1}[0-9]{8}$/)),
       fullName: joi.string().min(2).max(20),
      otp: joi.string().length(6).pattern(/^\d+$/),
      gender: joi.string().valid(...Object.values(genderEnum)),
      id: joi
      .string()
      .custom((value, helper) => {
        return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId");
      })
      ,

      
  file: {
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().allow(null),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().required(),
  },

}

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];

    if (typeof schema.validate === "function") {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.push(error.details);
      }
    } else {
     
      for (const key of Object.keys(schema)) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          validationErrors.push(error.details);
        }
      }
    }

    if (validationErrors.length) {
      return res
        .status(400)
        .json({ err_message: "validation error", data: validationErrors });
    }

    return next();
  });
};
