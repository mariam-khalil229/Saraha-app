export const emailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .email-header {
                background: #4f46e5;
                color: #ffffff;
                padding: 24px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
            }
            .email-body {
                padding: 32px;
                color: #374151;
                line-height: 1.6;
            }
            .otp-box {
                background: #f3f4f6;
                color: #1f2937;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                text-align: center;
                padding: 16px;
                margin: 24px 0;
                border-radius: 6px;
                border: 1px dashed #d1d5db;
            }
            .email-footer {
                background: #f9fafb;
                padding: 16px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #e5e7eb;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                Welcome to Sara7a!
            </div>
            <div class="email-body">
                <p>Hello,</p>
                <p>Thank you for signing up. To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
                
                <div class="otp-box">
                    ${otp}
                </div>
                
                <p>This code is valid for <strong>20 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                
                <p>Best regards,<br><strong>The Sara7a Team</strong></p>
            </div>
            <div class="email-footer">
                &copy; ${new Date().getFullYear()} Sara7a App. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};