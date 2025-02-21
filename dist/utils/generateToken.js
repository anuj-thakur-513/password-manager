"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const keys_1 = __importDefault(require("../config/keys"));
function generateToken(userId, isRefreshToken) {
    let token;
    if (isRefreshToken) {
        token = jsonwebtoken_1.default.sign({ userId }, keys_1.default.jwt.jwtSecret, {
            expiresIn: keys_1.default.jwt.refreshTokenExpiry,
        });
    }
    else {
        token = jsonwebtoken_1.default.sign({ userId }, keys_1.default.jwt.jwtSecret, {
            expiresIn: keys_1.default.jwt.accessTokenExpiry,
        });
    }
    return token;
}
function generateTokens(userId) {
    const accessToken = generateToken(userId, false);
    const refreshToken = generateToken(userId, true);
    return { accessToken, refreshToken };
}
