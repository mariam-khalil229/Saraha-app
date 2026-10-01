import { UserModel } from '../../DB/models/user.model.js';
import { hashPassword, comparePassword, Encrypt } from '../../security/security.utils.js';
import { create, findOne } from '../../DB/db.service.js';
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

export const signUpService = async ({ fName, lName, email, password, gender, phone }) => {
    const existingUser = await findOne({ model: UserModel, filter: { email } });
    if (existingUser) throw new Error("Email is already registered");

    const hashedPassword = await hashPassword(password);
    const encryptedPhone = Encrypt(phone);

    const createdUsers = await create({
        model: UserModel,
        data: { fName, lName, email, password, phone: encryptedPhone, gender }
    });

    return createdUsers[0]; 
};

// --- Gmail Sign Up Service ---
export const signUpWithGmailService = async (idToken) => {
    const decoded = await client.verifyIdToken({
        idToken,
        audience: "426702860833-eqe6uhptoscngjdksh8fborsblqqfsbi.apps.googleusercontent.com",
    });
    
    const {family_name, given_name, email, profilePicture, email_verified} = decoded.getPayload();
    let user = await findOne({ model: UserModel, filter: { email: email.toLowerCase() } });
    if (!user) {
        user = await Usemodel.create({
            fName: given_name,
            lName: family_name,
            email: email.toLowerCase(),
            profileImage: profilePicture,
            isConfirmed: email_verified,
            provider: "google"
        });
    }

    if (user.provider == "system") {
        return res.status(400).json({ message: "Email is already registered with a different provider" });
    }
     const access_token = jwt.sign({ id: user._id, email: user.email }, "mySuperSecretaccessKey456$%^", {
        expiresIn: 60*5,
    });

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "mySuperSecretRefreshKey456$%^", { 
        expiresIn: '7d' 
    });
};

export const signInService = async ({ email, password }) => {
    const user = await findOne({ model: UserModel, filter: { email } });
    if (!user) throw new Error("Invalid email or password");

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    const access_token = jwt.sign({ id: user._id, email: user.email }, "mySuperSecretaccessKey456$%^", {
        expiresIn: 60,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000",
        notBefore: 60,
        noTimestamp: true
    });

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "mySuperSecretRefreshKey456$%^", { 
        expiresIn: '7d' 
    });

    return { access_token, refresh_token };
};

export const getProfileService = async (token) => {
    const decoded = jwt.verify(token, "mySuperSecretaccessKey456$%^");
    
    const user = await findOne({ 
        model: UserModel, 
        filter: { email: decoded.email.toLowerCase() } 
    });
    
    if (!user) throw new Error("User not found");
    
    return user;
};