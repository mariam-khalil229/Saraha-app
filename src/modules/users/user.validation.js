import joi from 'joi';

export const SignUpSchema = {
    body: joi.object({
        fName: joi.string().required(),
        lName: joi.string().required(),
        email: joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).required(), 
        password: joi.string().required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        age: joi.number().integer().min(18).max(100).required(),
    }).options({ abortEarly: false, allowUnknown: true }),

    query: joi.object({
        flag: joi.boolean().required(),
    }).options({ abortEarly: false, allowUnknown: true })
};
        
        
    