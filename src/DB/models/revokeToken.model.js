import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema({

    tokenId: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiryAt: Date
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,

});

revokeTokenSchema.index({ "expiryAt": 1 }, { expireAfterSeconds: 0 });
export const RevokeTokenModel = mongoose.model('RevokeToken', revokeTokenSchema);
export default RevokeTokenModel;