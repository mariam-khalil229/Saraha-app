import { Router } from 'express';
import { signUp, signIn, getProfile, signUpwithGmail } from './user.controller.js';
import { authentication } from '../../middleware/authentication.js';
import { authorization } from '../../middleware/authorization.js';
import { validation } from '../../middleware/validation.js';
import { SignUpSchema } from './user.validation.js'; 
import { multerLocal } from '../../middleware/multer.js';

const router = Router();

router.post('/signup', validation(SignUpSchema), signUp);
router.post('/signin', signIn);
router.post('/profile', getProfile); 
router.post('/signup/gmail', signUpwithGmail); 
router.get('/profile', authentication, authorization(["user", "admin"]), getProfile); 

router.post('/signup-with-images', multerLocal({ customPath: "admins", customTypes: ['image/jpeg', 'image/png'] }).fields([
    { name: "attachment", max: 1 }, 
    { name: "attachments", max: 5 } 
]), validation(SignUpSchema), signUp);


export default router;