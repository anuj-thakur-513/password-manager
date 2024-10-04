import Mailer from "../services/Mailer";
import Redis from "../services/Redis";

const sendEmails = async (redisInstance: Redis) => {
    const mailer = Mailer.getInstance();
    while (true) {
        const current = await redisInstance.consumeFromQueue("otp_email");
        if (!current) {
            continue;
        }
        try {
            mailer.sendOtp(
                current._id,
                current.email,
                "Account Verification",
                current.name,
                current.otp,
                current.isVerificationEmail
            );
        } catch (error) {
            console.error("error while sending email:", error);
        }
    }
};

export default sendEmails;
