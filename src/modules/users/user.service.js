import { UserModel } from '../../DB/models/user.model.js';
import { hashPassword, comparePassword, Encrypt } from '../../security/security.utils.js';
import { create, findOne } from '../../DB/db.service.js';
import jwt from "jsonwebtoken";

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

import jwt from "jsonwebtoken";

export const signUpWithGmailService = async (idToken) => {
    const decodedGoogleToken = jwt.decode(idToken);

    if (!decodedGoogleToken) {
        throw new Error("Invalid Google Token");
    }

    const { email, given_name, family_name, picture } = decodedGoogleToken;
    console.log("Successfully parsed Google User:", { email, given_name, family_name });
    const access_token = jwt.sign({ email }, "mySuperSecretaccessKey456$%^", {
        expiresIn: 60,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000",
        notBefore: 60,
        noTimestamp: true
    });

    const refresh_token = jwt.sign({ email }, "mySuperSecretRefreshKey456$%^", { 
        expiresIn: '7d' 
    });

    return { 
        email, 
        name: `${given_name} ${family_name}`, 
        tokens: { access_token, refresh_token } 
    };
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