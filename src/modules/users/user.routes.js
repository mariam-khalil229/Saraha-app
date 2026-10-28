import { Router } from 'express';
import { signUp, signIn, getProfile, signUpwithGmail } from './user.controller.js';
import { authentication } from '../../middleware/authentication.js';
import { authorization } from '../../middleware/authorization.js';
import { validation } from '../../middleware/validation.js';
import { SignUpSchema } from './user.validation.js'; 
import { multerLocal } from '../../middleware/multer.js';
import { shareProfile } from './user.controller.js';
import { refreshToken } from './user.controller.js';
import { refreshTokenSchema } from './user.validation.js';
import { shareProfileSchema } from './user.validation.js';


const router = Router();

router.post('/signup', validation(SignUpSchema), signUp);
router.post('/signin', signIn);
router.post('/profile', getProfile); 
router.post('/signup/gmail', signUpwithGmail); 
router.post('/send-otp', sendOtp);
router.post('/resend-otp', reSendOtp);
router.get('/profile', authentication, authorization(["user", "admin"]), getProfile); 
router.get("/refresh-token",validation(refreshTokenSchema), refreshToken);
router.get('/profile/:id', validation(shareProfileSchema), shareProfile);
router.patch("/update-profile",validation(updateProfileSchema), authentication, authorization(["user", "admin"]), updateProfile);
router.patch("/update-password", validation(updatePasswordSchema), authentication, authorization(["user", "admin"]), updatePassword);
router.post("/logout", authentication, authorization(["user", "admin"]), logoutService);

router.post('/signup-with-images', multerLocal({ customPath: "admins", customTypes: ['image/jpeg', 'image/png'] }).fields([
    { name: "attachment", max: 1 }, 
    { name: "attachments", max: 5 } 
]), validation(SignUpSchema), signUp);


export default router;