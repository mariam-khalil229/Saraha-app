import joi from "joi";

export const generalRules = {
    id: joi.string().custom((value, helpers) => {
        return types.objectId.isValid(value) ? value : helpers.error("any.invalid");
    }).messages({
        "any.invalid": "Invalid ID format"
    }),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 2 }),
    password: joi.string(),
    file: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        path: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        size: joi.number().required()
    }).messages({
        "any.required": "file is required",
    }),
    headers: joi.object({
        authorization: joi.string().required(),
        connection: joi.string(),
        "accept-encoding": joi.string(),
        accept: joi.string(),
        "user-agent": joi.string(),
        host: joi.string(),
        "content-length": joi.string(),
        "postman-token": joi.string(),
        "cache-control": joi.string(),
    })
};