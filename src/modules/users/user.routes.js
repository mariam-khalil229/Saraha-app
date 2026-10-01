import { Router } from 'express';
import { signUp, signIn, getProfile, signUpwithGmail } from './user.controller.js';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/profile', getProfile); 
router.post('/signup/gmail', signUpwithGmail); 

export default router;