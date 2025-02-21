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
exports.handleForgotPassword = exports.handleResetPassword = exports.handleVerifyOtp = exports.handleResetOtpGeneration = exports.handleGenerateOtp = exports.handleLogout = exports.handleCheckLoginStatus = exports.handleLogin = exports.handleSignup = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const AppError_1 = __importDefault(require("../../core/AppError"));
const constants_1 = require("../../constants");
const user_1 = __importDefault(require("../../models/user"));
const otp_1 = __importDefault(require("../../models/otp"));
const generateToken_1 = require("../../utils/generateToken");
const ApiResponse_1 = __importDefault(require("../../core/ApiResponse"));
const cookiesConfig_1 = require("../../config/cookiesConfig");
const generateOtp_1 = __importDefault(require("../../utils/generateOtp"));
const otpRepository_1 = require("../../repository/otpRepository");
const Redis_1 = __importDefault(require("../../services/Redis"));
const redis = Redis_1.default.getInstance();
const handleSignup = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field === null || field.trim() === "")) {
        return next(new AppError_1.default(400, "Name, Email & Password are mandatory fields"));
    }
    if (!constants_1.EMAIL_REGEX.test(email)) {
        return next(new AppError_1.default(400, "Invalid format of email"));
    }
    const existingUser = yield user_1.default.findOne({ email: email });
    if (existingUser) {
        return next(new AppError_1.default(409, "Email already in use"));
    }
    const user = yield user_1.default.create({
        name: name,
        email: email,
        password: password,
    });
    if (!user) {
        return next(new AppError_1.default(500, "Error while registering user, please try again later"));
    }
    const { accessToken, refreshToken } = (0, generateToken_1.generateTokens)(user._id);
    const updatedUser = yield user_1.default.findOneAndUpdate({ _id: user._id }, {
        $set: { refreshToken: refreshToken },
    }, {
        new: true,
    }).select("-refreshToken -password -createdAt -updatedAt -__v");
    return res
        .status(201)
        .cookie("accessToken", accessToken, cookiesConfig_1.AUTH_COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, cookiesConfig_1.AUTH_COOKIE_OPTIONS)
        .json(new ApiResponse_1.default({ updatedUser }, "User registered successfully"));
}));
exports.handleSignup = handleSignup;
const handleLogin = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if ([email, password].some((field) => field === null || field.trim() === "")) {
        return next(new AppError_1.default(400, "Email and Password are mandatory fields"));
    }
    if (!constants_1.EMAIL_REGEX.test(email)) {
        return next(new AppError_1.default(400, "Invalid format of email"));
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return next(new AppError_1.default(404, "user not found"));
    }
    const passwordMatched = yield user.isPasswordCorrect(password);
    if (!passwordMatched) {
        return next(new AppError_1.default(401, "Password Incorrect"));
    }
    const { accessToken, refreshToken } = (0, generateToken_1.generateTokens)(user._id);
    const updatedUser = yield user_1.default.findOneAndUpdate({ _id: user._id }, {
        $set: {
            refreshToken: refreshToken,
        },
    }).select("-refreshToken -password -createdAt -updatedAt -__v");
    return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(new ApiResponse_1.default({ updatedUser }, "Logged in successfully"));
}));
exports.handleLogin = handleLogin;
const handleCheckLoginStatus = (req, res) => {
    let user = req === null || req === void 0 ? void 0 : req.user;
    return res.status(200).json(new ApiResponse_1.default({
        _id: user === null || user === void 0 ? void 0 : user._id,
        name: user === null || user === void 0 ? void 0 : user.name,
        email: user === null || user === void 0 ? void 0 : user.email,
        isVerified: user === null || user === void 0 ? void 0 : user.isVerified,
    }, "User is Logged In"));
};
exports.handleCheckLoginStatus = handleCheckLoginStatus;
const handleResetPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, oldPassword, newPassword } = req.body;
    if ([email, oldPassword, newPassword].some((field) => field === null || field.trim() === "")) {
        return next(new AppError_1.default(400, "Email, Old Password & New Password are mandatory fields"));
    }
    if (!constants_1.EMAIL_REGEX.test(email)) {
        return next(new AppError_1.default(400, "Invalid format of email"));
    }
    if (oldPassword === newPassword) {
        return next(new AppError_1.default(400, "New password cannot be same as old password"));
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return next(new AppError_1.default(404, "user not found"));
    }
    const passwordMatched = yield user.isPasswordCorrect(oldPassword);
    if (!passwordMatched) {
        return next(new AppError_1.default(401, "Old Password Incorrect"));
    }
    user.password = newPassword;
    yield user.save();
    return res.status(200).json(new ApiResponse_1.default({}, "Password reset successfully"));
}));
exports.handleResetPassword = handleResetPassword;
const handleForgotPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    if ([email, otp, newPassword].some((field) => field === null || field.trim() === "")) {
        return next(new AppError_1.default(400, "Email, OTP & New Password are mandatory fields"));
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return next(new AppError_1.default(404, "user not found"));
    }
    const otpRecord = yield otp_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id }).sort({ updatedAt: "desc" });
    if (!otpRecord) {
        return next(new AppError_1.default(401, "Invalid OTP"));
    }
    const isOtpCorrect = yield (0, otpRepository_1.verifyOtp)(otpRecord, otp);
    if (!isOtpCorrect) {
        return next(new AppError_1.default(401, "OTP Verification Failed"));
    }
    user.password = newPassword;
    yield user.save();
    return res.status(200).json(new ApiResponse_1.default({}, "Password reset successfully"));
}));
exports.handleForgotPassword = handleForgotPassword;
const handleLogout = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse_1.default({}, "Logged out successfully"));
}));
exports.handleLogout = handleLogout;
const handleGenerateOtp = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const otp = (0, generateOtp_1.default)();
    const otpSaved = yield (0, otpRepository_1.saveOtp)(otp, user === null || user === void 0 ? void 0 : user._id);
    if (!otpSaved) {
        return next(new AppError_1.default(500, "Error while generating OTP, please try again later"));
    }
    yield redis.addToQueue("otp_email", {
        _id: user === null || user === void 0 ? void 0 : user._id,
        email: user === null || user === void 0 ? void 0 : user.email,
        name: user === null || user === void 0 ? void 0 : user.name,
        otp: otp,
        isVerificationEmail: true,
    });
    return res.status(200).json(new ApiResponse_1.default({}, "OTP generated successfully"));
}));
exports.handleGenerateOtp = handleGenerateOtp;
const handleResetOtpGeneration = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return next(new AppError_1.default(400, "Email is required"));
    }
    if (!constants_1.EMAIL_REGEX.test(email)) {
        return next(new AppError_1.default(400, "Invalid format of email"));
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return next(new AppError_1.default(404, "user not found"));
    }
    const otp = (0, generateOtp_1.default)();
    const otpSaved = yield (0, otpRepository_1.saveOtp)(otp, user === null || user === void 0 ? void 0 : user._id);
    if (!otpSaved) {
        return next(new AppError_1.default(500, "Error while generating OTP, please try again later"));
    }
    // send OTP over mail to the user -> when scaling up the application this should be handled by a queue
    yield redis.addToQueue("otp_email", {
        _id: user === null || user === void 0 ? void 0 : user._id,
        email: user === null || user === void 0 ? void 0 : user.email,
        name: user === null || user === void 0 ? void 0 : user.name,
        otp: otp,
        isVerificationEmail: false,
    });
    return res.status(200).json(new ApiResponse_1.default({}, "OTP generated successfully"));
}));
exports.handleResetOtpGeneration = handleResetOtpGeneration;
const handleVerifyOtp = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { enteredOtp, email } = req.body;
    let user = req.user;
    if (!user) {
        user = (yield user_1.default.findOne({ email: email })) || undefined;
        if (!user) {
            return next(new AppError_1.default(404, "user not found"));
        }
    }
    if (!enteredOtp) {
        return next(new AppError_1.default(400, "OTP is required"));
    }
    const otpRecord = yield otp_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id, isActive: true });
    if (!otpRecord) {
        return next(new AppError_1.default(401, "Invalid OTP"));
    }
    const isOtpCorrect = yield (0, otpRepository_1.verifyOtp)(otpRecord, enteredOtp);
    if (!isOtpCorrect) {
        return next(new AppError_1.default(401, "OTP Verification Failed"));
    }
    yield user_1.default.updateOne({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { isVerified: true } });
    return res.status(200).json(new ApiResponse_1.default({}, "OTP verified successfully"));
}));
exports.handleVerifyOtp = handleVerifyOtp;
