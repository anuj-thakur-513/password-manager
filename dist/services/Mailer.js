"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
const keys_1 = __importDefault(require("../config/keys"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const otp_1 = __importDefault(require("../models/otp"));
class Mailer {
    constructor() {
        this.resendClient = new resend_1.Resend(keys_1.default.resend.apiKey);
    }
    static getInstance() {
        if (!Mailer.resendInstance) {
            Mailer.resendInstance = new Mailer();
        }
        return this.resendInstance;
    }
    sendOtp(userId, userEmail, subject, userName, otp, isVerificationEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpRecord = yield otp_1.default.findOne({ userId: userId, otp: otp });
                if (!otpRecord || !otpRecord.isActive) {
                    return false;
                }
                let renderedHtml;
                if (isVerificationEmail) {
                    renderedHtml = yield ejs_1.default.renderFile(path_1.default.resolve(__dirname, "../../templates/email/accountVerification.ejs"), {
                        otp: otp,
                        name: userName,
                    });
                }
                else {
                    renderedHtml = yield ejs_1.default.renderFile(path_1.default.resolve(__dirname, "../../templates/email/passwordReset.ejs"), { otp: otp });
                }
                const res = yield this.resendClient.emails.send({
                    from: "Password Manager <noreply@updates.anujthakur.dev>",
                    to: userEmail || "onboarding@resend.dev",
                    subject: subject,
                    html: renderedHtml,
                });
                return true;
            }
            catch (error) {
                console.log("Error sending the mail:", error);
                return false;
            }
        });
    }
}
exports.default = Mailer;
