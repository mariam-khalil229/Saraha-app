import mongoose from "mongoose";

export default async function ConnectionDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/sarah7a", { serverSelectionTimeoutMS: 5000, useNewUrlParser: true, useUnifiedTopology: true });
        console.log("DB Connected Successfully......");
    } catch (error) {
        console.log("DB Connected Failed......");
    }
}