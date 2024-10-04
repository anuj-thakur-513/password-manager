import mongoose from "mongoose";

interface UserWithSensitiveInfo {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    isVerified?: boolean;
    refreshToken?: string;
    password?: string;
}

export default UserWithSensitiveInfo;
