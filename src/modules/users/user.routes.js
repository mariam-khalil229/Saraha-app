import { Router } from 'express';
import { 
    signUp, 
    signIn, 
    verify2FA,
    getProfile, 
    signUpwithGmail,
    shareProfile,
    refreshToken,
    sendOtp,
    reSendOtp,
    updateProfile,
    updatePassword,
    logout,
    confirmEmail,
    forgotPassword,
    resetPassword
} from './user.controller.js';

import { authentication } from '../../common/middleware/authentication.js';
import { authorization } from '../../common/middleware/authorization.js';
import { validation } from '../../common/middleware/validation.js';
import { multerLocal } from '../../common/middleware/multer.js';

import { 
    SignUpSchema, 
    refreshTokenSchema, 
    shareProfileSchema,
    updateProfileSchema,
    updatePasswordSchema,
    confirmationEmailSchema
} from './user.validation.js'; 

const router = Router();

router.post('/signup', validation(SignUpSchema), signUp);
router.post('/signup-with-images', multerLocal({ customPath: "admins", customTypes: ['image/jpeg', 'image/png'] }).fields([
    { name: "attachment", max: 1 }, 
    { name: "attachments", max: 5 } 
]), validation(SignUpSchema), signUp);
router.post('/signup/gmail', signUpwithGmail); 

router.post('/signin', signIn); 
router.post('/verify-2fa', verify2FA); 

router.post('/send-otp', sendOtp);
router.post('/resend-otp', reSendOtp);
router.get("/refresh-token", validation(refreshTokenSchema), refreshToken);
router.post("/logout", authentication, authorization(["user", "admin"]), logout);
router.post("/confirm-email", validation(confirmationEmailSchema), confirmEmail);
router.post("/confirm-email/:token", confirmEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get('/profile', authentication, authorization(["user", "admin"]), getProfile); 
router.get('/profile/:id', validation(shareProfileSchema), shareProfile);
router.patch("/update-profile", validation(updateProfileSchema), authentication, authorization(["user", "admin"]), updateProfile);
router.patch("/update-password", validation(updatePasswordSchema), authentication, authorization(["user", "admin"]), updatePassword);

export default router;