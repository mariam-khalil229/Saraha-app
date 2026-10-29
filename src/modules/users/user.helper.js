import { setValue, getValue, ttl, deleteKeys, keys, incr } from '../../service/redis.service.js';
import sendEmail from '../../common/service/sendEmail.js';
import { eventEmitter } from '../../common/utils/events.js';
import { emailTemplate } from '../../common/utils/emailTemplate.js';
import { findOne } from '../../service/db.service.js';
import { UserModel } from '../../DB/models/user.model.js';
import { generateOTP } from '../../common/service/sendEmail.js';
import { hashSync } from 'bcrypt';

export const sendOtp = async ({email, isConfirmed}) => {
const isBlocked_ttl = await ttl(`otp::block::${email}`);
    
    if (isBlocked_ttl > 0) throw new Error(`you're blocked, you can resend otp after ${isBlocked_ttl} seconds`);
    
    if (isBlocked_ttl < 0) {
        if (getValue(`otp::max::${email}`) >= 3) {
            await setValue({
                key: `otp::max::${email}`,
                value: 0,
                ttl: 60 * 5
            });
        }
    }
    
    const otpTtl = await ttl(`otp::${email}`);
    if (otpTtl > 0) throw new Error(`resend otp after ${otpTtl} seconds`);

    const max_opt = await getValue(`otp::max::${email}`);
    if (max_opt >= 3) {
        await setValue({
            key: `otp::block::${email}`,
            value: "1",
            ttl: 60 * 10
        });
        throw new Error(`you have exceeded the maximum umbers of tries`);
    }
    
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            isConfirmed: { $exists: isConfirmed }
        }
    });
    
    if (!user) throw new Error("user not exist or already confirmed");
    
    const otp = await generateOTP();
    const otpHash = hashSync(otp, 12);
    
    await setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 20
    });
    
    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject: "Verify Your Email - Sara7a",
            html: emailTemplate(otp)
        });
    });
    
    await incr(`otp::max::${email}`);
}
 