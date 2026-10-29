import jwt from 'jsonwebtoken';
import { UserModel } from '../../DB/models/user.model.js'; 
import { ttl } from '../../service/redis.service.js';

// =================== Strict Authentication ===================
export const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(400).json({ message: "token not exist" });
        }

        const decoded = jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded?.id) {
            return res.status(400).json({ message: "InValid token" });
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        if (user.isConfirmed === false) {
            throw new Error("user not confirmed yet", { cause: 400 });
        }

        if (user.changeCredentialsAt?.getTime() > decoded.iat * 1000) {
            throw new Error("InValid token, you should login again", { cause: 401 });
        }

        if (await ttl(`revokeToken::${user._id}::${decoded.jti}`) > 0) {
            throw new Error("InValid revoked token, you should login again", { cause: 401 });
        }

        req.user = user;
        req.decoded = decoded;
        return next();
    } catch (error) {
        const status = error.cause || 500;
        return res.status(status).json({ message: error.message });
    }
};

// =================== Optional Authentication ===================
export const optionalAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return next();
        }

        const decoded = jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded?.id) {
            return res.status(400).json({ message: "InValid token" });
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        if (user.isConfirmed === false) {
            throw new Error("user not confirmed yet", { cause: 400 });
        }

        if (user.changeCredentialsAt?.getTime() > decoded.iat * 1000) {
            throw new Error("InValid token, you should login again", { cause: 401 });
        }

        if (await ttl(`revokeToken::${user._id}::${decoded.jti}`) > 0) {
            throw new Error("InValid revoked token, you should login again", { cause: 401 });
        }

        req.user = user;
        req.decoded = decoded;
        return next();
    } catch (error) {
        const status = error.cause || 500;
        return res.status(status).json({ message: error.message });
    }
};