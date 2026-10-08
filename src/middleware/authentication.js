import jwt from "jsonwebtoken";
import { findOne } from '../DB/db.service.js';
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
        throw new Error("user not exist ", { cause: 400 })}

    req.user = user;    
    next()
}