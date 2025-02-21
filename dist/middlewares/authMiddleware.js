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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const AppError_1 = __importDefault(require("../core/AppError"));
const keys_1 = __importDefault(require("../config/keys"));
const user_1 = __importDefault(require("../models/user"));
const cookiesConfig_1 = require("../config/cookiesConfig");
const generateToken_1 = require("../utils/generateToken");
const mongoose_1 = require("mongoose");
const verifyToken = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.header("Access-Token")) === null || _b === void 0 ? void 0 : _b.replace("Bearer", ""));
    if (!token) {
        return next(new AppError_1.default(401, "No access token found"));
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, keys_1.default.jwt.jwtSecret);
        const user = yield user_1.default.findOne({ _id: decodedToken.userId }).select("-createdAt -updatedAt -__v");
        if (!user) {
            return next(new AppError_1.default(401, "Invalid Access Token"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError" || error.statusCode === 401) {
            const token = ((_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken) || ((_d = req.header("Refresh-Token")) === null || _d === void 0 ? void 0 : _d.replace("Bearer ", ""));
            if (!token) {
                return next(new AppError_1.default(401, "Unauthorized Request"));
            }
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, keys_1.default.jwt.jwtSecret);
                const user = yield user_1.default.findOne({
                    _id: decodedToken.userId,
                }).select("-createdAt -updatedAt");
                if ((user === null || user === void 0 ? void 0 : user.refreshToken) !== token) {
                    return next(new AppError_1.default(401, "Unauthorized Request"));
                }
                const { accessToken, refreshToken } = (0, generateToken_1.generateTokens)(new mongoose_1.Types.ObjectId(decodedToken.userId));
                user.refreshToken = refreshToken;
                yield user.save();
                req.user = user;
                res.cookie("accessToken", accessToken, cookiesConfig_1.AUTH_COOKIE_OPTIONS).cookie("refreshToken", refreshToken, cookiesConfig_1.AUTH_COOKIE_OPTIONS);
                next();
            }
            catch (error) {
                console.log(error);
                return next(new AppError_1.default(401, "Unauthorized Request"));
            }
        }
    }
}));
exports.default = verifyToken;
