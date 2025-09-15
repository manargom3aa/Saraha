
import { auth, authentication, authorization } from '../../middleware/authentication.middleware.js';
import { tokenTypeEnum } from '../../utils/security/token.security.js';
import { endpoint } from './user.authorization.js';
import { validation } from '../../middleware/validation.middleware.js';
import * as userService from './user.service.js'
import * as validators from './user.service.js'
import { Router } from "express";
import { fileValidation } from '../../utils/multer/local.multer.js';
import { cloudFileUpload } from '../../utils/multer/cloud.multer.js';
const router = Router();


router.use(authentication())
router.post("/logout", authentication(), userService.logout)
router.get("/",authentication(),validation(validators.logout), userService.profile)
router.get("/",auth(),authorization({accessRoles:endpoint.profile}), userService.profile)
router.get("/:userId",validation(validators.shareProfile),userService.shareProfile)

router.get("/refresh-token", authentication({tokenType:tokenTypeEnum.refresh}) , userService.getNewLoginCredentials)
router.patch("/",authorization(),validation(validators.updateBasicInfo), userService.updateBasicInfo)    
router.patch("{/:userId}/restore-account",auth({accessRoles:endpoint.restoreAccount}),validation(validators.restoreAccount),userService.restoreAccount)  
 router.patch("/password",authentication(),validation(validators.updatePassword),userService.updatePassword)  
router.delete("{/:userId}/freeze-account", authorization(),validation(validators.freezeAccount),userService.freezeAccount)  

 router.delete("/:userId",auth({accessRoles:endpoint.deleteAccount}),validation(validators.deleteAccount),userService.deleteAccount)  

    router.patch("/profile-image",
   authentication(),
   cloudFileUpload({ validation:fileValidation.image }).single("image"),
  userService.profileImage)  

  router.patch("/profile-cover-images",
   authentication(),
   cloudFileUpload({ customPath: "user" , validation:fileValidation.image }).array("images",2),
   validation(validators.coverImage),
 userService.profileCoverImages) 

export default router