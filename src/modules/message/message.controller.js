import { authentication } from '../../middleware/authentication.middleware.js';
import { validation } from '../../middleware/validation.middleware.js';
import { cloudFileUpload } from '../../utils/multer/cloud.multer.js';
import { fileValidation } from '../../utils/multer/local.multer.js';
import * as messageService from './message.service.js'
import * as validators from './message.validation.js'
import { Router } from 'express'
const router = Router({
    caseSensitive: true,
    strict:true
});


router.post(
    "/:receiverId",
    cloudFileUpload({ validation: fileValidation.image}).array("attachments", 2),
    validation(validators.sendMessage),
    messageService.sendMessage
)

router.post(
    "/:receiverId/sender",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image}).array("attachments", 2),
    validation(validators.sendMessage),
    messageService.sendMessage
)


export default router