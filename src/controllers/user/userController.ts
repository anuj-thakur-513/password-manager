import { NextFunction, Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler";
import AppError from "../../core/AppError";
import { EMAIL_REGEX } from "../../constants";
import User from "../../models/user";
import Otp from "../../models/otp";
import { generateTokens } from "../../utils/generateToken";
import ApiResponse from "../../core/ApiResponse";
import { AUTH_COOKIE_OPTIONS } from "../../config/cookiesConfig";
import generateOtp from "../../utils/generateOtp";
import { saveOtp, verifyOtp } from "../../repository/otp";
import sendEmail from "../../utils/sendEmail";
import Redis from "../../services/Redis";

const handleSignup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field === null || field.trim() === "")) {
        return next(new AppError(400, "Name, Email & Password are mandatory fields"));
    }

    if (!EMAIL_REGEX.test(email)) {
        return next(new AppError(400, "Invalid format of email"));
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return next(new AppError(409, "Email already in use"));
    }

    const user = await User.create({
        name: name,
        email: email,
        password: password,
    });

    if (!user) {
        return next(new AppError(500, "Error while registering user, please try again later"));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    const updatedUser = await User.updateOne(
        { _id: user._id },
        {
            $set: { refreshToken: refreshToken },
        },
        {
            new: true,
        }
    ).select("-refreshToken -password -createdAt -updatedAt -__v");

    return res
        .status(201)
        .cookie("accessToken", accessToken, AUTH_COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, AUTH_COOKIE_OPTIONS)
        .json(new ApiResponse({ updatedUser }, "User registered successfully"));
});

const handleLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if ([email, password].some((field) => field === null || field.trim() === "")) {
        return next(new AppError(400, "Email and Password are mandatory fields"));
    }

    if (!EMAIL_REGEX.test(email)) {
        return next(new AppError(400, "Invalid format of email"));
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return next(new AppError(404, "user not found"));
    }

    const passwordMatched = await user.isPasswordCorrect(password);
    if (!passwordMatched) {
        return next(new AppError(401, "Password Incorrect"));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
            $set: {
                refreshToken: refreshToken,
            },
        }
    ).select("-refreshToken -password -createdAt -updatedAt -__v");

    return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(new ApiResponse({ updatedUser }, "Logged in successfully"));
});

const handleCheckLoginStatus = (req: Request, res: Response) => {
    let user = req?.user;
    return res.status(200).json(
        new ApiResponse(
            {
                _id: user?._id,
                name: user?.name,
                email: user?.email,
                isVerified: user?.isVerified,
            },
            "User is Logged In"
        )
    );
};

const handleLogout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse({}, "Logged out successfully"));
});

const handleGenerateOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const otp = generateOtp();
    const otpSaved = await saveOtp(otp, user?._id);
    if (!otpSaved) {
        return next(new AppError(500, "Error while generating OTP, please try again later"));
    }

    // send OTP over mail to the user -> when scaling up the application this should be handled by a queue
    const redis = Redis.getInstance();
    await redis.addToQueue("otp_email", { email: user?.email, name: user?.name, otp: otp });
    return res.status(200).json(new ApiResponse({}, "OTP generated successfully"));
});

const handleVerifyOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { enteredOtp } = req.body;
    const user = req.user;
    if (!enteredOtp) {
        return next(new AppError(400, "OTP is required"));
    }

    const otpRecord = await Otp.findOne({ userId: user?._id, isActive: true });
    if (!otpRecord) {
        return next(new AppError(401, "Invalid OTP"));
    }
    const curr = new Date();
    const diff = curr.getTime() - otpRecord?.createdAt.getTime();
    const diffInMinutes = Math.floor(diff / 1000 / 60);
    if (diffInMinutes > 10) {
        return next(new AppError(401, "OTP expired"));
    }

    const isOtpCorrect = await verifyOtp(otpRecord, enteredOtp);
    if (!isOtpCorrect) {
        return next(new AppError(401, "Incorrect OTP"));
    }
    await Otp.updateOne({ _id: otpRecord._id }, { $set: { isActive: false } });
    await User.updateOne({ _id: user?._id }, { $set: { isVerified: true } });

    return res.status(200).json(new ApiResponse({}, "OTP verified successfully"));
});

export {
    handleSignup,
    handleLogin,
    handleCheckLoginStatus,
    handleLogout,
    handleGenerateOtp,
    handleVerifyOtp,
};
