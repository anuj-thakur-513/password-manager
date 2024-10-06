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
    const curr = new Date();
    const diff = curr.getTime() - otpRecord?.createdAt.getTime();
    const diffInMinutes = Math.floor(diff / 1000 / 60);
    if (diffInMinutes > 10) {
        return false;
    }
    if (otpRecord.otp === userOtp) {
        await Otp.updateOne({ _id: otpRecord._id }, { $set: { isActive: false } });
        return true;
    }
    return false;
};

export { saveOtp, verifyOtp };
