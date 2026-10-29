import { 
    signUpService, 
    signInService, 
    verify2FAService, 
    signUpWithGmailService, 
    refreshTokenService,
    getProfile as getProfileService,
    shareProfile as shareProfileService,
    sendOtp as sendOtpService,
    reSendOtp as reSendOtpService,
    updateProfileService,
    updatePasswordService,
    logoutService as logoutServiceFn,
    confirmEmail as confirmEmailService,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService
} from './user.service.js';

export const signUp = async (req, res, next) => {
    return await signUpService(req, res, next);
};

export const signIn = async (req, res) => {
    try {
        const response = await signInService(req.body);
        // Returns { message, userId }
        return res.status(200).json(response);
    } catch (error) {
        const status = error.cause || 400;
        return res.status(status).json({ message: error.message });
    }
};

export const verify2FA = async (req, res) => {
    try {
        const tokens = await verify2FAService(req.body); 
        return res.status(200).json({ message: "Login successful", tokens });
    } catch (error) {
        const status = error.cause || 400;
        return res.status(status).json({ message: error.message });
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

export const confirmEmail = async (req, res, next) => {
    try {
        return await confirmEmailService(req, res, next);
    } catch (error) {
        const status = error.cause || 400;
        return res.status(status).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        return await forgotPasswordService(req, res, next);
    } catch (error) {
        const status = error.cause || 400;
        return res.status(status).json({ message: error.message });
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        return await resetPasswordService(req, res, next);
    } catch (error) {
        const status = error.cause || 400;
        return res.status(status).json({ message: error.message });
    }
};

export const sendOtp = async (req, res, next) => await sendOtpService(req, res, next);
export const reSendOtp = async (req, res, next) => await reSendOtpService(req, res, next);
export const updateProfile = async (req, res, next) => await updateProfileService(req, res, next);
export const updatePassword = async (req, res, next) => await updatePasswordService(req, res, next);
export const logout = async (req, res, next) => await logoutServiceFn(req, res, next);