import { 
    signUpService, 
    signInService, 
    signUpWithGmailService, 
    getProfileService,
    refreshTokenService 
} from './user.service.js';

import { shareProfile as shareProfileService } from './user.service.js';

export const signUp = async (req, res, next) => {
    return await signUpService(req, res, next);
};

export const signIn = async (req, res) => {
    try {
        const tokens = await signInService(req.body);
        return res.status(200).json({ message: "Done", tokens });
    } catch (error) {
        if (error.message === "Invalid email or password") {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message, stack: error.stack });
    }
};

export const getProfile = async (req, res, next) => {
    return await getProfileService(req, res, next);
};


export const shareProfile = async (req, res, next) => {
    return await shareProfileService(req, res, next);
};

export const signUpwithGmail = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "Google ID Token is required" });
        }

        const payload = await signUpWithGmailService(idToken);
        return res.status(201).json({ message: "Gmail login successful", payload });
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack });
    }
};

export const refreshToken = async (req, res, next) => {
    return await refreshTokenService(req, res, next);
};