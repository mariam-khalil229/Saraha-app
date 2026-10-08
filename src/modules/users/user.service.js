import { UserModel } from '../../DB/models/user.model.js';
import { hashPassword, comparePassword, Encrypt } from '../../security/security.utils.js';
import { create, findOne } from '../../DB/db.service.js';
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { hashSync } from 'bcrypt';

const client = new OAuth2Client();

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
        })
       
        
        return res.status(201).json({ message: "Done", user });

    } catch (error) {
        console.log("ACTUAL ERROR:", error); 
        if (error?.code == 11000) {
            return res.status(409).json({ message: "email already exists" });
        }
        return res.status(500).json({ message: error.message });
    }
}

// --- Gmail Sign Up Service ---
export const signUpWithGmailService = async (idToken) => {
    const decoded = await client.verifyIdToken({
        idToken,
        audience: "426702860833-eqe6uhptoscngjdksh8fborsblqqfsbi.apps.googleusercontent.com",
    });
    
    const {family_name, given_name, email, profilePicture, email_verified} = decoded.getPayload();
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

export const getProfileService = async (req, res, next) => {
  return res.status(200).json({ message: "Done", user: req.user });

};