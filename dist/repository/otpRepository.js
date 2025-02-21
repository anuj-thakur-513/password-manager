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
exports.verifyOtp = exports.saveOtp = void 0;
const otp_1 = __importDefault(require("../models/otp"));
const saveOtp = (otp, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        return false;
    }
    const dbOtp = yield otp_1.default.create({
        userId: userId,
        otp: otp,
    });
    if (!dbOtp) {
        return false;
    }
    return true;
});
exports.saveOtp = saveOtp;
const verifyOtp = (otpRecord, userOtp) => __awaiter(void 0, void 0, void 0, function* () {
    const curr = new Date();
    const diff = curr.getTime() - (otpRecord === null || otpRecord === void 0 ? void 0 : otpRecord.createdAt.getTime());
    const diffInMinutes = Math.floor(diff / 1000 / 60);
    if (diffInMinutes > 10) {
        return false;
    }
    if (otpRecord.otp === userOtp) {
        yield otp_1.default.updateOne({ _id: otpRecord._id }, { $set: { isActive: false } });
        return true;
    }
    return false;
});
exports.verifyOtp = verifyOtp;
