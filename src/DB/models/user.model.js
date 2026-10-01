import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    lName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return this.provider === "system" ? true : false;
        },
        trim: true
    },
    phone: {
        type: String,
         required: function() {
            return this.provider === "system" ? true : false;
        },
    },
    gender: {
        type: String, 
        enum: ["male", "female"],
        default: "male"
    },
    profileImage: String,
    provider: {
        type: String,
        enum: ["system", "google"],
        default: "system"
    },
    isConfirmed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export const UserModel = mongoose.model('User', userSchema);