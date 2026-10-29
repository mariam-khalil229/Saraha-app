import mongoose from "mongoose";

export default async function ConnectionDB() {
    try {
        await mongoose.connect(process.env.CONNECTION_URL_DB, { serverSelectionTimeoutMS: 5000, useNewUrlParser: true, useUnifiedTopology: true });
        console.log("DB Connected Successfully......");
    } catch (error) {
        console.log("DB Connected Failed......");
    }
}