import { signUpService, signInService, signUpwithGmailService, getProfileService } from './user.service.js';

export const signUp = async (req, res) => {
    try {
        const user = await signUpService(req.body);
        return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        if (error.message === "Email is already registered") {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message, stack: error.stack });
    }
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

export const getProfile = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ message: "Token is required" });
        }

        const user = await getProfileService(token);
        return res.status(200).json({ message: "Done", user });
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Invalid or expired token", error: error.message });
    }
};

export const signUpwithGmail = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({ message: "Google ID Token is required" });
        }

        const user = await signUpwithGmailService(idToken);
        return res.status(201).json({ message: "Gmail login successful", user });
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack });
    }
};