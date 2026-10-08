export const authorization = (roles = []) =>  {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new Error("You are not authorized to access this resource", { cause: 403 });
        }
        next();
    };
};