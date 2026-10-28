import { UserModel } from '../../DB/models/user.model.js';
import { comparePassword, Encrypt } from '../../security/security.utils.js';
import { findOne } from '../../service/db.service.js';
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
const client = new OAuth2Client();

// Secrets & Config
const ACCESS_TOKEN_SECRET = "mySuperSecretaccessKey456$%^";
const REFRESH_TOKEN_SECRET = "mySuperSecretRefreshKey456$%^";

// --- Sign Up Service ---
export const signUpService = async (req, res, next) => {
    try {
        const { fName, lName, email, password, age, gender, phone } = req.body;
        const hashPassword = hashSync(password, 12);

        const paths = [];
        if (req.files?.attachments) {
            for (const file of req.files.attachments) {
                paths.push(file.path);
            }
        }

        const profileImagePath = req.files?.attachment 
            ? req.files.attachment[0].path 
            : ""; 

        const user = await UserModel.create({
            fName,
            lName,
            email,
            password: hashPassword,
            age,
            gender,
            phone, 
            profileImage: profileImagePath,
            coverImages: paths
        });
       
        return res.status(201).json({ message: "Done", user });

    } catch (error) {
        console.log("ACTUAL ERROR:", error); 
        if (error?.code == 11000) {
            return res.status(409).json({ message: "email already exists" });
        }
        return res.status(500).json({ message: error.message });
    }
};

// --- Update Profile Service ---
export const updateProfileService = async (req, res, next) => {
    const { fName, lName, phone, gender, age } = req.body
    let query = {}
    if (fName) query.fName = fName
    if (lName) query.lName = lName
    if (phone) query.phone = Encrypt(phone)
    if (gender) query.gender = gender
    if (age) query.age = age
    await UserModel.findByIdAndUpdate(req.user.id, query, { new: true })
    return res.status(200).json({ message: "Done" })
};

// ---update password service---
export const updatePasswordService = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid old password" });
    }
    req.user.password = await hashSync(newPassword);
    req.user.changeCredAt = new Date();
    req.user.save();
    await UserModel.findByIdAndUpdate(req.user.id, { password: hashPassword }, { new: true });
    return res.status(200).json({ message: "Done" });
};

// --- Gmail Sign Up Service ---
export const signUpWithGmailService = async (idToken) => {
    const decoded = await client.verifyIdToken({
        idToken,
        audience: "426702860833-eqe6uhptoscngjdksh8fborsblqqfsbi.apps.googleusercontent.com",
    });
    
    const { family_name, given_name, email, profilePicture, email_verified } = decoded.getPayload();
    let user = await findOne({ model: UserModel, filter: { email: email.toLowerCase() } });
    
    if (!user) {
        user = await UserModel.create({
            fName: given_name,
            lName: family_name,
            email: email.toLowerCase(),
            profileImage: profilePicture,
            isConfirmed: email_verified,
            provider: "google"
        });
    }

    if (user.provider === "system") {
        throw new Error("Email is already registered with a different provider");
    }

    const access_token = jwt.sign({ id: user._id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 5,
    });

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, REFRESH_TOKEN_SECRET, { 
        expiresIn: '7d' 
    });

    return { access_token, refresh_token };
};

// =================== signInService (Step 1: Check Credentials & Trigger 2FA) ===================
export const signInService = async ({ email, password }) => {
    // 1. Check if the account is currently blocked in Redis
    const blockKey = `login::block::${email}`;
    const isBlocked = await ttl(blockKey); 
    if (isBlocked > 0) {
        throw new Error(`Too many attempts. Try again in ${isBlocked} seconds`, { cause: 429 });
    }

    const user = await findOne({ model: UserModel, filter: { email } });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
        const attemptsKey = `login::attempts::${email}`;
        let attempts = await getValue(attemptsKey) || 0;
        attempts = parseInt(attempts) + 1;

        if (attempts >= 5) {
            await setValue({ key: blockKey, value: "blocked", ttl: 60 * 15 });
            throw new Error("Maximum login attempts exceeded. Account blocked for 15 minutes.", { cause: 429 });
        } else {
            await setValue({ key: attemptsKey, value: attempts, ttl: 60 * 15 });
            throw new Error(`Invalid email or password. You have ${5 - attempts} attempts left.`);
        }
    }

    await setValue({ key: `login::attempts::${email}`, value: 0, ttl: 1 });
    const otp = await generate_otp(); 
    const otpHash = hashSync(otp, 12);
    
    await setValue({
        key: `2fa::${user._id}`,
        value: otpHash,
        ttl: 60 * 5 
    });

    eventEmitter.emit("send_email", async () => {
        await sendEmail({
            to: email,
            subject: "Your Two-Step Verification Code",
            html: emailTemplate(otp)
        });
    });

    return { 
        message: "Credentials verified. Please check your email for the 2FA code.", 
        userId: user._id 
    };
};

// =================== verify2FAService (Step 2: Verify OTP & Issue Tokens) ===================
export const verify2FAService = async ({ userId, otp }) => {
    // 1. Retrieve the hashed OTP from Redis
    const otpKey = `2fa::${userId}`;
    const storedOtpHash = await getValue(otpKey);

    if (!storedOtpHash) {
        throw new Error("OTP expired or invalid. Please log in again.", { cause: 400 });
    }

    const { compareSync } = await import('bcrypt'); 
    const isValidOtp = compareSync(otp, storedOtpHash);

    if (!isValidOtp) {
        throw new Error("Invalid 2FA code", { cause: 400 });
    }
    await setValue({ key: otpKey, value: "", ttl: 1 });

    const user = await findOne({ model: UserModel, filter: { _id: userId } });
    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }

    const tokenId = randomUUID();

    const access_token = jwt.sign({ id: user._id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 5,
        jwtid: tokenId
    });

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, REFRESH_TOKEN_SECRET, { 
        expiresIn: '7d',
        jwtid: tokenId
    });

    return { access_token, refresh_token };
};

// ===================shareProfile===================
export const shareProfile = async (req, res, next) => {
    const { id } = req.params

    let user = await dbService.findById({
        model: userModel,
        id,
        options: { password: 0 }
    })
    if (!user) {
        throw new Error("use not exist ", { cause: 400 })
    }

    user.phone = Decrypt(user.phone)

    return res.status(200).json({ message: "Done", user })

};  

// --- Refresh Token Service ---
export const refreshTokenService = async (req, res, next) => {
    try {
        const { refreshToken } = req.headers;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token header is required" });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        if (!decoded?.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const access_token = jwt.sign(
            { id: user._id, email: user.email },
            ACCESS_TOKEN_SECRET,
            { expiresIn: 60 * 5 }
        );

        return res.status(200).json({
            message: "Token refreshed successfully",
            access_token
        });

    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// --- logout Service ---
export const logoutService = async (req, res, next) => {
    const {flag} = req.query
    if (flag && flag === "all") {
        req.user.changeCredAt = new Date();
        await req.user.save();
        await deleteKeys(await keys(`revokeToken::${req.user._id}::*`))
    
    }
    else {
        await setValue({
            key: `revokeToken::${req.user._id}::${req.decoded.jti}`,
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor(Date.now() / 1000)
        });
    }

    req.user.changeCredAt = new Date();
    await req.user.save();
    return res.status(200).json({ message: "Logged out successfully" });
};

// =================== sendOtp ===================
export const sendOtp = async (req, res, next) => {
    const { email } = req.body;
    
    const user = await dbService.findOne({
        model: userModel,
        filter: { email }
    });
    
    if (user && user.isConfirmed !== false) {
        throw new Error("User already exists and is confirmed");
    }
    
    const otp = await generate_otp();
    const otpHash = hashSync(otp, 12);
    
    await setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 20
    });
    
    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject: "Confirm Email",
            html: emailTemplate(otp)
        });
    });
    
    await setValue({
        key: `otp::max::${email}`,
        value: 1,
        ttl: 60 * 60 
    });
    
    return res.status(200).json({ message: "Done" });
};

// =================== reSendOtp ===================
export const reSendOtp = async (req, res, next) => {
    const { email } = req.body
    const isBlocked_ttl = await ttl(`otp::block::${email}`)
    if (isBlocked_ttl > 0) throw new Error(`you're blocked, you can resend otp after ${isBlocked_ttl} seconds`)
    if (isBlocked_ttl < 0) {
        if (getValue(`otp::max::${email}`) >= 3) {
            await setValue({
                key: `otp::max::${email}`,
                value: 0,
                ttl: 60 * 5
            })
        }
    }
    const otpTtl = await ttl(`otp::${email}`)
    if (otpTtl > 0) throw new Error(`resend otp after ${otpTtl} seconds`)

    const max_opt = await getValue(`otp::max::${email}`)
    if (max_opt >= 3) {
        await setValue({
            key: `otp::block::${email}`,
            value: "1",
            ttl: 60 * 10
        })
        throw new Error(`you have exceeded the maximum umbers of tries`)
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: {
            email,
            isConfirmed: { $exists: false }
        }
    })
    if (!user) throw new Error("user not exist or already confirmed")
    const otp = await generate_otp()
    const otpHash = hashSync(otp, 12)
    await setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 20
    })
    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject: "Confirm Email",
            html: emailTemplate(otp)
        })
    })
    await incr(`otp::max::${email}`)
    return res.status(200).json({ message: "Done", user })
}

