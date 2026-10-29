import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function() {
            return this.attachment?.length > 0 && this.attachment?.[0] ? false : true;
        },
        trim: true
    },
    attachment: [String], 
    userId: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export const MessageModel = mongoose.model('Message', messageSchema);