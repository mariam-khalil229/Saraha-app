import jwt from "jsonwebtoken";
import { findOne } from '../service/db.service.js';
import { UserModel } from '../DB/models/user.model.js';

export const authentication = async (req, res, next) => {

    const { authorization } = req.headers;
    
    if (!authorization) {
        return res.status(401).json({ message: "Authorization header is missing" });
    }

    const decoded = jwt.verify(authorization, "mySuperSecretaccessKey456$%^")
    if (!decoded?.id) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }

    const user = await findOne({
        model: UserModel,
        filter: { _id: decoded.id }
    })

    if (!user) {
        throw new Error("user not exist ", { cause: 400 })
    }

    if (user?.changeCredAt?.getTime() > decoded.iat * 1000) {
        return res.status(401).json({ message: "Token is invalid due to password change" });
    }

    if (await ttl(`revokeToken::${user._id}::${decoded.jti}`) > 0) {
        throw new Error ("invalid token", { cause: 401 })
    }
    req.user = user;
    req.decoded = decoded;    
    next()
}