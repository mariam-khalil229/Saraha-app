
export const validation =(Schema) => (req, res, next) => {
    const errors = [];
    for (const key of Object.keys(Schema)) {
        const { error } = Schema [key].validate(req[key], { abortEarly: false });
        if (error) {
            error.details.forEach((error) => {
                errors.push(
                    message = error.message,
                    path = error.path [0],
                    key
                );
            });
            return res.status(400).json({ message: error });
        }
    }
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }
        next();
};