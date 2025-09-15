
 import * as DBService from '../../DB/db.service.js'

import { UserModel } from "../../DB/models/User.model.js"
import { deleteFolderByPrefix, deleteResources, destroyFile, uploadFile, uploadFiles } from "../../utils/multer/cloudinary.js"
import { asyncHandler , successResponse } from "../../utils/response.js"
import { decryptEncryption } from "../../utils/security/encryption.security.js"
import { createRevokeToken, generateLoginCredentials } from "../../utils/security/token.security.js"

 
export const profile = asyncHandler(async (req , res, next) =>{
   const user = await DBService.findById({
      model: UserModel,
      id: req.user._id,
      populate: [{ path: "messages" }]
   })
   user.phone= await decryptEncryption({ cipherText: req.user.phone })
   return successResponse({ res , data:{ user } })
})


export const shareProfile = asyncHandler(
   async (req , res, next) => {
  
      const { userId } = req.params;
      const user = await DBService.findOne({
         model: UserModel,
         filter: {
            _id: userId,
            confirmEmail: { $exists: true }
         }
      })
 
   return user? successResponse({res , data:{ user }}) : next(new Error("In-valid account",{ cause:404 }))
})

export const updateBasicInfo = asyncHandler(
   async (req , res, next) => {
         
        if (req.body.phone) {
           req.body.phone = await generateEncryption({ plaintext: req.body.phone})
        }
         const user = await DBService.findOneAndUpdate({
         model: UserModel,
         filter: { _id: req.user._id },
         data:{
            $set:req.body,
            $inc: { __v:1 }
         },
      })
 
   return user? successResponse({res , data:{user}}) : next(new Error("In-valif account",{cause:404}))
})

export const getNewLoginCredentials = asyncHandler(async (req , res, next) =>{
       
        const credentials = await generateLoginCredentials ({ user: req.user })
   
        return successResponse ({res,  data:{ credentials }})
   
       }
     
)



export const freezeAccount = asyncHandler(
   async (req , res, next) => {
         
         const { userId }= req.params;
         if (userId && req.user.role !== roleEnum.admin) {
            return next(new Error("Not authorized account",{ cause:403 }))
         }
         const user = await DBService.findOneAndUpdate({
         model: UserModel,
         filter: { _id: userId || req.user._id,
            deletedAt: {$exists:false}
          },
         data:{
           deletedAt: Date.now(),
           deletedBy: req.user._id,
           changeCredentialsTime : new Date(),
           $unset:{
            restoredAt: 1,
            restoredBy: 1
           }
         }
      })
 
   return user? successResponse({res , data:{user}}) : next(new Error("In-valid account",{cause:404}))
})


export const restoreAccount = asyncHandler(
   async (req , res, next) => {
         
         const { userId }= req.params;
        
         const user = await DBService.findOneAndUpdate({
         model: UserModel,
         filter: { _id: userId ,
            deletedAt: {$exists:true},
            deletedBy: { $ne: userId}
          },
         data:{
            $unset: {
                  deletedAt: 1,
                  deletedBy: 1
            },
            restoredAt: Date.now(),
            restoredBt: req.user._id
         }
      })
 
   return user? successResponse({res , data:{user}}) : next(new Error("In-valid account",{cause:404}))
})


export const deleteAccount = asyncHandler(
   async (req , res, next) => {
         
         const { userId }= req.params;
      
         const user = await DBService.deleteOne({
         model: UserModel,
         filter: { _id: userId  ,
            deletedAt: {$exists:true}
          },
          
      })
      if (user.deletedCount) {
         await deleteFolderByPrefix({prefix:`user/${userId}`})
      }
 
   return user.deletedCount ? successResponse({res , data:{user}}) : next(new Error("In-valid account",{cause:404}))
})





export const logout = asyncHandler
(async (req , res, next) =>{
   
   const { flag } = req.body;
   let status = 200
   switch (flag) {
      case logoutEnum.signoutFromAll:
           
           await DBService.updateOne({
               model: UserModel,
               filter:{ _id: req.decoded._id },
               data:{
                  changeCredentialsTime: new Date()
               }
            })
         break;
   
      default:
           await createRevokeToken({ req })

         status =201
         break;
   }


   return successResponse({res , status ,data :{}})
})

export const updatePassword = asyncHandler(
   async (req , res, next) => {
         
      const { oldPassword, password ,flag }= req.body
      if (!await compareHash({plaintext: oldPassword,hashValue: req.user.password})){
         return next(new Error ("In-valid old password"))
      }

      if (req.user.oldPasswords?.length) {
         for (const hashPassword of req.user.oldPasswords ){
               if (await compareHash({plaintext: password, hashValue:hashPassword })) {
                  return next (new Error("this password is used before "))
               }
         }
      }
 

   let updatedData = {}   
   switch (flag) {
      case logoutEnum.signoutFromAll:
           updatedData.changeCredentialsTime = new Date()
        
         break;
   
          case logoutEnum.signout:
           await createRevokeToken({ req })
         break;
      default:
 
         break;
   }
    
         const user = await DBService.findOneAndUpdate({
         model: UserModel,
         filter: { _id: req.user._id },
         data:{
           password: await generateHash({ plaintext: password}),
           ...updatedData,
           $push:{oldPasswords: req.user.password}
         }
      })
 
   return user? successResponse({res , data:{user}}) : next(new Error("In-valid account",{cause:404}))
})


export const profileImage = asyncHandler(
   async (req , res, next) => {
         const {secure_url, public_id} = await uploadFile({ file: req.file, path:`user/${req.user._id}`})
      const user = await DBService.findOneAndUpdate({
         model:UserModel,
         filter:{_id:req.user._id},
         data:{
            picture:{secure_url,public_id}
         }
      })
   return successResponse({res , data:{ user }})
})


export const profileCoverImages = asyncHandler(
   async (req , res, next) => {
   
      const attachments = await uploadFiles({ files:req.files, path: `user/${req.user._id}/cover` })
      const user = await DBService.findOneAndUpdate({
         model:UserModel,
         filter:{_id:req.user._id},
         data:{
           cover: attachments
         },
         options:{
            new: false
         }
      })
      if (user?.cover?.length) {
         await deleteResources({
            public_ids: user.cover.map(ele => ele.public_id)
         })
      }
  
   return   successResponse({res , data:{ user }})
})