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
exports.handleDeletePassword = exports.handleGetPassword = exports.handleGetAllPasswords = exports.handleUpdatePassword = exports.handleAddPassword = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const AppError_1 = __importDefault(require("../../core/AppError"));
const passwords_1 = require("../../models/passwords");
const ApiResponse_1 = __importDefault(require("../../core/ApiResponse"));
const crypto_1 = require("../../utils/crypto");
const handleAddPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { username, email, password } = req.body;
    const platformUrl = req.body.platformUrl;
    let platformName = req.body.platformName;
    if (!username && !email) {
        return next(new AppError_1.default(400, "Username or email is required"));
    }
    if (!platformUrl && !platformName) {
        return next(new AppError_1.default(400, "Platform URL or Platform Name is required"));
    }
    if (!password) {
        return next(new AppError_1.default(400, "Password is required"));
    }
    if (!platformName) {
        platformName = platformUrl.split(".")[1];
    }
    const encryptedPassword = (0, crypto_1.encrypt)(password);
    const existingData = yield passwords_1.Password.findOne({
        platformName: platformName,
        email: email,
        username: username,
    });
    if (existingData) {
        if ((username && username === existingData.username) || (email && email === existingData.email)) {
            const data = yield passwords_1.Password.updateOne({ platformName: platformName }, {
                $set: {
                    password: encryptedPassword,
                },
            }, {
                new: true,
            }).select("-_id -__v -user -createdAt -updatedAt");
            return res.status(200).json(new ApiResponse_1.default(data, "Password updated successfully"));
        }
    }
    const data = yield passwords_1.Password.create({
        user: user === null || user === void 0 ? void 0 : user._id,
        platformUrl: platformUrl === "" ? null : platformUrl,
        platformName: platformName,
        username: username === "" ? null : username,
        email: email === "" ? null : email,
        password: encryptedPassword,
    });
    return res.status(201).json(new ApiResponse_1.default({
        platformName: data.platformName,
        platformUrl: data.platformUrl || "",
        username: data.username || "",
        email: data.email || "",
        password: password,
    }, "Password added successfully"));
}));
exports.handleAddPassword = handleAddPassword;
const handleUpdatePassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { platformName, platformUrl, username, email, password } = req.body;
    if (!platformName && !platformUrl) {
        return next(new AppError_1.default(400, "Platform Name or Platform URL is required"));
    }
    if (!username && !email) {
        return next(new AppError_1.default(400, "Username or email is required"));
    }
    if (!password) {
        return next(new AppError_1.default(400, "Password is required"));
    }
    const dbPassword = yield passwords_1.Password.findOne(Object.assign(Object.assign(Object.assign(Object.assign({ user: user === null || user === void 0 ? void 0 : user._id }, (platformName && { platformName })), (platformUrl && { platformUrl })), (username && { username })), (email && { email })));
    if (!dbPassword) {
        return next(new AppError_1.default(404, "Password not found"));
    }
    const encryptedPassword = (0, crypto_1.encrypt)(password);
    dbPassword.password = encryptedPassword;
    yield dbPassword.save();
    return res.status(200).json(new ApiResponse_1.default({
        platformName: platformName,
        platformUrl: platformUrl || "",
        username: username || "",
        email: email || "",
        password: password,
    }, "Password updated successfully"));
}));
exports.handleUpdatePassword = handleUpdatePassword;
const handleGetAllPasswords = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { limit, page } = req.query;
    if (!limit && !page) {
        return next(new AppError_1.default(400, "Skip, limit & page are required"));
    }
    const passwords = yield passwords_1.Password.find({ user: user === null || user === void 0 ? void 0 : user._id })
        .sort({ updatedAt: -1 })
        .select("-__v -user -createdAt -updatedAt")
        .lean();
    // pagination
    const totalPasswords = passwords.length;
    const limitInt = parseInt(limit) || 10;
    const pageInt = parseInt(page) || 1;
    const totalPages = Math.ceil(totalPasswords / limitInt);
    if (pageInt > totalPages) {
        return next(new AppError_1.default(400, "Page number is greater than total pages"));
    }
    const start = (pageInt - 1) * limitInt;
    const end = start + limitInt;
    const passwordsSlice = passwords.slice(start, end);
    const data = [];
    passwordsSlice.forEach((password) => {
        if (password.password) {
            const decryptedPassword = (0, crypto_1.decrypt)(password.password);
            data.push(Object.assign(Object.assign({}, password), { password: decryptedPassword }));
        }
    });
    return res.status(200).json(new ApiResponse_1.default({ data, totalPages }, "Passwords fetched successfully"));
}));
exports.handleGetAllPasswords = handleGetAllPasswords;
const handleGetPassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const platform = req.params.platform;
    const passwords = yield passwords_1.Password.find({
        platformName: { $regex: platform, $options: "i" },
    })
        .sort({ updatedAt: -1 })
        .select("-__v -user -createdAt -updatedAt")
        .lean();
    const data = [];
    passwords.forEach((password) => {
        if (password.password) {
            const decryptedPassword = (0, crypto_1.decrypt)(password.password);
            data.push(Object.assign(Object.assign({}, password), { password: decryptedPassword }));
        }
    });
    return res.status(200).json(new ApiResponse_1.default(data, "Password fetched successfully"));
}));
exports.handleGetPassword = handleGetPassword;
const handleDeletePassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { passwordId } = req.params;
    if (!passwordId) {
        return next(new AppError_1.default(400, "Password ID is required"));
    }
    yield passwords_1.Password.findByIdAndDelete(passwordId);
    return res.status(200).json(new ApiResponse_1.default({}, "Password deleted successfully"));
}));
exports.handleDeletePassword = handleDeletePassword;
