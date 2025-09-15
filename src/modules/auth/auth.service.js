
import { providerEnum, UserModel} from '../../DB/models/User.model.js' 

import { asyncHandler, successResponse } from '../../utils/response.js';
import * as DBService from '../../DB/db.service.js'
 import { compareHash,generateHash } from '../../utils/security/hash.security.js';
import { generateEncryption } from '../../utils/security/encryption.security.js';
 
import { generateLoginCredentials } from '../../utils/security/token.security.js';
import { OAuth2Client } from 'google-auth-library';
import { getNewLoginCredentials } from '../user/user.service.js';
import { emailEvent } from '../../utils/events/email.event.js';
import { customAlphabet } from 'nanoid';


export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const existingUser = await DBService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (existingUser) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  const hashPassword = await generateHash({ plaintext: password });
  const encPhone = await generateEncryption({ plaintext: phone });
  const otp = customAlphabet('0123456789',6)()
  const confirmEmailOtp = await generateHash({ plaintext: otp })
  const user = await DBService.create({
  model: UserModel,
  data: {
    fullName,
    email,
    password: hashPassword,
    phone: encPhone,
    confirmEmailOtp,
  },
});

  emailEvent.emit("confirmEmail", {to:email , otp:otp})
  return successResponse({
    res,
    status: 201,
    data: { user },
  });
});

//-------------------------------------------------------------------------------------------------------


 export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true }
    }
  });

  if (!user) {
    return next(new Error("Invalid account or already verified", { cause: 404 }));
  }

    if (!await compareHash({ plaintext: otp , hashValue: user.confirmEmailOtp })) {
    return next(new Error("Invalid otp "));
  }

  
  const updatedUser = await DBService.updateOne({
      model: UserModel,
      filter: { email },
      data: {
        confirmEmail: Date.now(),
        $unset: { confirmEmailOtp: true },
        $inc: { __v: 1 }
      }
  })

  return updatedUser.matchedCount
    ? successResponse({ res, status: 200, data: {} })
    : next(new Error("Failed to confirm email"));
});

//------------------------------------------------------

export const login = asyncHandler(
    async (req,res,next) =>{

        const {  email, password } = req.body;
        const user = await DBService.findOne( {
             model:UserModel,
              filter: { email, provider: providerEnum.system },
            })
        if (!user) {
            return  next(new Error("in-valid login data ", {cause:404}))
        }

  if (!user.confirmEmail) {
    return next(new Error("Please verify your account first", { cause: 403 }));
  }

  if (user.deletedAt) {
    return next(new Error("this account is deleted", { cause:404 }))
  }
       if (!await compareHash ({plaintext: password,hashValue:user.password })){
    
        return next (new Error("in-valid login Data", { cause: 404}))
       }
     
      const credentials = await generateLoginCredentials({ user })

     return successResponse ({ res,  data:{ credentials } })

    }

)

async function  verifyGooglAccount (idToken= {}) {
  
const client = new OAuth2Client();
 
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID.split(",")
  });
  const payload = ticket.getPayload();
  return payload
}
 

export const signupWithGmail = asyncHandler(
  async (req, res, next) => {
  const { idToken } = req.body;
  const {picture, name , email, email_verified} = await verifyGooglAccount({ idToken })
  if (!email_verified) {
    return next(new Error("not verified account", { cause:400}))
  }
 
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email }
  })
 
  if (user){
    if(user.provider === providerEnum.google){
           const credentials = await getNewLoginCredentials ({ user })
         return successResponse({res,status: 200,data: {credentials},});
    }
    return next(new Error("Email exist", {cause:409}))
  }

  const [newUser] = await DBService({
    model: UserModel,
    data: [{
      fullName: name,
      email,
      picture,
      confirmEmail: Date.now(),
      provider: providerEnum.google
    }]
  })

  const credentials = await getNewLoginCredentials ({ user: newUser })

  return successResponse({
    res,
    status: 201,
    data: { credentials },
  });


});

export const loginWithGmail = asyncHandler(
  async (req, res, next) => {
  const { idToken } = req.body;
  const {  email, email_verified} = await verifyGooglAccount({ idToken })
  if (!email_verified) {
    return next(new Error("not verified account", { cause:400}))
  }
 
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email , provider: providerEnum.google}
  })
 
  if (!user){
    return next(new Error("in-valid login data or in-valid provider", {cause:404}))
  }
     const credentials = await getNewLoginCredentials ({ user })

  return successResponse({
    res,
    status: 200,
    data: {credentials},
  });
});


export const updatePassword = asyncHandler(
  async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?._id;

    const user = await DBService.findById({
      model: UserModel,
      id: userId,
    });

    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }

    const isMatch = await compareHash({
      plaintext: oldPassword,
      hashValue: user.password
    });

    if (!isMatch) {
      return next(new Error("Old password is incorrect", { cause: 400 }));
    }

    const hashedPassword = await generateHash({
      plaintext: newPassword,
    });

    user.password = hashedPassword;
    await user.save();

    return successResponse({
      res,
      message: "Password updated successfully"
    });
  }
);

export const sendForgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const otp = customAlphabet("0123456789", 6)()
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
    data: {
      forgotPasswordOtp: await generateHash({ plaintext: otp })
      }
  })
  if (!user) {
    return next(new Error("in-valid account", { cause:404 }))
  }

  emailEvent.emit("sendForgotPassword", { to: email, subject: "Forgot password", title:"Reset-Password", otp})
  return successResponse({ res })
});

export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      forgotPasswordOtp: { $exists:true },
      provider: providerEnum.system,
    },
   })
  if (!user) {
    return next(new Error("in-valid account", { cause:404 }))
  }
  if (!await compareHash({ plaintext:otp, hashValue: user.forgotPasswordOtp })) {
    return next(new Error("In-valid otp", { cause:400 }))
  }

  return successResponse({ res })
});


export const resetPassword = asyncHandler(async (req, res, next) => {
 const { email, otp , password } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      forgotPasswordOtp: { $exists:true },
      provider: providerEnum.system,
    },
   })
  if (!user) {
    return next(new Error("in-valid account", { cause:404 }))
  }
  if (!await compareHash({ plaintext:otp, hashValue: user.forgotPasswordOtp })) {
    return next(new Error("In-valid otp", { cause:400 }))
  }

  await DBService.updateOne({
    model: UserModel,
    filter:{
      email
    },
    data:{
      password: await generateHash({ plaintext: password })
    }
  })
  return successResponse({ res })
});
