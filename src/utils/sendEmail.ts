import path from "path";
import ApiResponse from "../core/ApiResponse";
import Mailer from "../services/Mailer";
import ejs from "ejs";

const mailer = Mailer.getInstance();

const sendEmail = async (
    userEmail: string | undefined,
    subject: string,
    userName: string | undefined,
    otp: string,
    isVerificationEmail: boolean = true
): Promise<ApiResponse> => {
    try {
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
            renderedHtml = path.resolve(__dirname, "../../templates/email/passwordReset.ejs");
        }
        const res = await mailer.emails.send({
            from: "Password Manager <onboarding@resend.dev>",
            to: userEmail || "onboarding@resend.dev",
            subject: subject,
            html: renderedHtml,
        });
        return new ApiResponse({ success: true }, "email sent successfully");
    } catch (error) {
        console.log("Error sending the mail:", error);
        return new ApiResponse({ success: false }, "Error sending the mail");
    }
};

export default sendEmail;
