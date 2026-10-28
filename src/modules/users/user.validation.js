import joi from "joi";
import { generalFields } from "../utils/generalRules.js";
import { generalRules } from "../../common/utils/generalRules.js";

export const refreshTokenSchema = {
    headers: generalRules.headers.required(),
};

export const shareProfileSchema = {
    params: joi.object({
    id: generalRules.id.required()}),
    headers: generalRules.headers.required(),
};

export const SignUpSchema = {
    body: joi.object({
        fName: joi.string().min(2).max(50).required(),
        lName: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.string().valid(joi.ref("password")).required(),
        phone: joi.string().required(),
        age: joi.number().min(18).max(100)
    }),
    files: joi.object({
        attachment: joi.array().items(generalFields.file).max(1).optional(),
        attachments: joi.array().items(generalFields.file).max(5).optional()
    }).optional()
}; 

export const updateProfileSchema = {
    body: joi.object({
        fName: joi.string().min(2).max(50),
        lName: joi.string().min(2).max(50),
        password: joi.string(),
        phone: joi.string(),
        age: joi.number().min(18).max(100)
    }),

}; 

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().required(),
        newPassword: joi.string().required(),
        confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required()
    })
};   
    
        
    