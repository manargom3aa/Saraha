import * as authService from './auth.service.js';
import { Router } from 'express';
import * as validators from './auth.validation.js' 
import { validation } from '../../middleware/validation.middleware.js';
const router = Router();

router.post('/signup', validation(validators.signup),authService.signup); 
router.patch('/confirm-email',validation(validators.confirmEmail), authService.confirmEmail); 

router.post('/login', validation(validators.login),authService.login); 
router.post('/signup/gmail',validation(validators.loginWithGmail),  authService.signupWithGmail); 
router.post('/login/gmail',validation(validators.loginWithGmail),  authService.loginWithGmail); 

router.patch('/updatePassword', authService.updatePassword); 
router.patch('/reset-password', validation(validators.resetPassword), authService.resetPassword); 
router.patch('/send-forgot-password', validation(validators.sendForgotPassword), authService.sendForgotPassword); 

router.patch('/verify-forgot-password', validation(validators.verifyForgotPassword), authService.verifyForgotPassword); 


export default router;
