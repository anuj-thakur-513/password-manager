import { Resend } from "resend";
import config from "../config/keys";

class Mailer {
    private static resendInstance: Resend;

    private constructor() {}

    static getInstance() {
        if (!Mailer.resendInstance) {
            Mailer.resendInstance = new Resend(config.resend.apiKey);
        }
        return this.resendInstance;
    }
}

export default Mailer;
