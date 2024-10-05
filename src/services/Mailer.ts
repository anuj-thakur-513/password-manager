import { Resend } from "resend";
import config from "../config/keys";
import path from "path";
import ejs from "ejs";
import Otp from "../models/otp";

class Mailer {
    private static resendInstance: Mailer;
    private resendClient: Resend;
    private constructor() {
        this.resendClient = new Resend(config.resend.apiKey);
    }

    static getInstance() {
        if (!Mailer.resendInstance) {
            Mailer.resendInstance = new Mailer();
        }
        return this.resendInstance;
    }

    public async sendOtp(
        userId: string,
        userEmail: string | undefined,
        subject: string,
        userName: string | undefined,
        otp: string,
        isVerificationEmail: boolean
    ) {
        try {
            const otpRecord = await Otp.findOne({ userId: userId, otp: otp });
            if (!otpRecord || !otpRecord.isActive) {
                return false;
            }
            let renderedHtml;
            if (isVerificationEmail) {
                renderedHtml = await ejs.renderFile(
                    path.resolve(__dirname, "../../templates/email/accountVerification.ejs"),
                    {
                        otp: otp,
                        name: userName,
                    }
                );
            } else {
                renderedHtml = await ejs.renderFile(
                    path.resolve(__dirname, "../../templates/email/passwordReset.ejs"),
                    { otp: otp }
                );
            }
            const res = await this.resendClient.emails.send({
                from: "Password Manager <onboarding@resend.dev>",
                to: userEmail || "onboarding@resend.dev",
                subject: subject,
                html: renderedHtml,
            });
            return true;
        } catch (error) {
            console.log("Error sending the mail:", error);
            return false;
        }
    }
}

export default Mailer;
