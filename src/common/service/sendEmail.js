import nodemailer from "nodemailer";
import { randomInt } from "crypto";

const sendEmail = async ({ to, subject, html, attachments } = {}) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

  const info = await transporter.sendMail({
     from: `"Sara7a App" <${process.env.EMAIL_USER}>`, 
     to, 
     subject, 
     html: html || "",
     attachments: attachments || [], 
  });
  return info.accepted.length > 0 ? true : false;
}

export const generateOTP = () => {
    return randomInt(100000, 999999).toString();
}

export default sendEmail;