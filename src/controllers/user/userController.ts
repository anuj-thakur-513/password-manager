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
import { saveOtp, verifyOtp } from "../../repository/otpRepository";
import Redis from "../../services/Redis";
const redis = Redis.getInstance();

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
    const updatedUser = await User.findOneAndUpdate(
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

const handleResetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, oldPassword, newPassword } = req.body;
        if (
            [email, oldPassword, newPassword].some((field) => field === null || field.trim() === "")
        ) {
            return next(
                new AppError(400, "Email, Old Password & New Password are mandatory fields")
            );
        }

        if (!EMAIL_REGEX.test(email)) {
            return next(new AppError(400, "Invalid format of email"));
        }
        if (oldPassword === newPassword) {
            return next(new AppError(400, "New password cannot be same as old password"));
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(new AppError(404, "user not found"));
        }
        const passwordMatched = await user.isPasswordCorrect(oldPassword);
        if (!passwordMatched) {
            return next(new AppError(401, "Old Password Incorrect"));
        }

        user.password = newPassword;
        await user.save();
        return res.status(200).json(new ApiResponse({}, "Password reset successfully"));
    }
);

const handleForgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, newPassword } = req.body;
        if ([email, otp, newPassword].some((field) => field === null || field.trim() === "")) {
            return next(new AppError(400, "Email, OTP & New Password are mandatory fields"));
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(new AppError(404, "user not found"));
        }

        const otpRecord = await Otp.findOne({ userId: user?._id }).sort({ updatedAt: "desc" });
        if (!otpRecord) {
            return next(new AppError(401, "Invalid OTP"));
        }

        const isOtpCorrect = await verifyOtp(otpRecord, otp);
        if (!isOtpCorrect) {
            return next(new AppError(401, "OTP Verification Failed"));
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json(new ApiResponse({}, "Password reset successfully"));
    }
);

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
    await redis.addToQueue("otp_email", {
        _id: user?._id,
        email: user?.email,
        name: user?.name,
        otp: otp,
        isVerificationEmail: req.body.isVerificationEmail,
    });
    return res.status(200).json(new ApiResponse({}, "OTP generated successfully"));
});

const handleResetOtpGeneration = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        if (!email) {
            return next(new AppError(400, "Email is required"));
        }
        if (!EMAIL_REGEX.test(email)) {
            return next(new AppError(400, "Invalid format of email"));
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return next(new AppError(404, "user not found"));
        }
        const otp = generateOtp();
        const otpSaved = await saveOtp(otp, user?._id);
        if (!otpSaved) {
            return next(new AppError(500, "Error while generating OTP, please try again later"));
        }
        // send OTP over mail to the user -> when scaling up the application this should be handled by a queue
        await redis.addToQueue("otp_email", {
            _id: user?._id,
            email: user?.email,
            name: user?.name,
            otp: otp,
            isVerificationEmail: false,
        });
        return res.status(200).json(new ApiResponse({}, "OTP generated successfully"));
    }
);

const handleVerifyOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { enteredOtp, email } = req.body;
    let user = req.user;

    if (!user) {
        user = (await User.findOne({ email: email })) || undefined;
        if (!user) {
            return next(new AppError(404, "user not found"));
        }
    }

    if (!enteredOtp) {
        return next(new AppError(400, "OTP is required"));
    }

    const otpRecord = await Otp.findOne({ userId: user?._id, isActive: true });
    if (!otpRecord) {
        return next(new AppError(401, "Invalid OTP"));
    }

    const isOtpCorrect = await verifyOtp(otpRecord, enteredOtp);
    if (!isOtpCorrect) {
        return next(new AppError(401, "OTP Verification Failed"));
    }
    await User.updateOne({ _id: user?._id }, { $set: { isVerified: true } });

    return res.status(200).json(new ApiResponse({}, "OTP verified successfully"));
});

export {
    handleSignup,
    handleLogin,
    handleCheckLoginStatus,
    handleLogout,
    handleGenerateOtp,
    handleResetOtpGeneration,
    handleVerifyOtp,
    handleResetPassword,
    handleForgotPassword,
};
