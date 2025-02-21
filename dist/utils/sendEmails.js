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
const Mailer_1 = __importDefault(require("../services/Mailer"));
const sendEmails = (redisInstance) => __awaiter(void 0, void 0, void 0, function* () {
    const mailer = Mailer_1.default.getInstance();
    while (true) {
        const current = yield redisInstance.consumeFromQueue("otp_email");
        if (!current) {
            continue;
        }
        try {
            yield mailer.sendOtp(current._id, current.email, "Account Verification", current.name, current.otp, current.isVerificationEmail);
        }
        catch (error) {
            console.error("error while sending email:", error);
        }
    }
});
exports.default = sendEmails;
