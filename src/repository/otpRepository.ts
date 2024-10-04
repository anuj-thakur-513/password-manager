import { Types } from "mongoose";
import Otp from "../models/otp";
import OtpSchema from "../types/otpSchema";

const saveOtp = async (otp: string, userId: Types.ObjectId | undefined): Promise<boolean> => {
    if (!userId) {
        return false;
    }
    const dbOtp = await Otp.create({
        userId: userId,
        otp: otp,
    });

    if (!dbOtp) {
        return false;
    }
    return true;
};

const verifyOtp = async (otpRecord: OtpSchema, userOtp: string): Promise<boolean> => {
    if (otpRecord.otp === userOtp) {
        await Otp.updateOne({ _id: otpRecord._id }, { $set: { isActive: false } });
        return true;
    }
    return false;
};

export { saveOtp, verifyOtp };
