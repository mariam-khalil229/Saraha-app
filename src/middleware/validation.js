import joi from "joi";

export const Validation = (schema) => {
    return (req, res, next) => {
        const errResult = [];
        const requestData = {
            ...req.body,
            ...req.params,
            ...req.query,
            ...(req.file && { file: req.file }),
            ...(req.files && { files: req.files })
        };

        for (const key of Object.keys(schema)) {
            const dataToValidate = req[key] || requestData[key];
            
            if (schema[key]) {
                const { error } = schema[key].validate(dataToValidate, { abortEarly: false });
                if (error) {
                    error.details.forEach(err => {
                        errResult.push({
                            message: err.message,
                            path: err.path[0],
                            key
                        });
                    });
                }
            }
        }

        if (errResult.length > 0) {
            return res.status(400).json({ message: "Validation error", error: errResult });
        }
        next();
    };
};