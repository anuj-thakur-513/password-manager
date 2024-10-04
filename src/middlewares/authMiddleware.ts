import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../core/AppError";
import config from "../config/keys";
import User from "../models/user";
import JwtPayload from "../types/jwtPayload";
import { AUTH_COOKIE_OPTIONS } from "../config/cookiesConfig";
import { generateTokens } from "../utils/generateToken";
import { Types } from "mongoose";

const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token: string =
        req?.cookies?.accessToken || req.header("Access-Token")?.replace("Bearer", "");
    if (!token) {
        return next(new AppError(401, "No access token found"));
    }

    try {
        const decodedToken = jwt.verify(token, config.jwt.jwtSecret as Secret) as JwtPayload;

        const user = await User.findOne({ _id: decodedToken.userId }).select(
            "-createdAt -updatedAt -__v"
        );
        if (!user) {
            return next(new AppError(401, "Invalid Access Token"));
        }
        req.user = user;
        next();
    } catch (error: any) {
        console.log(error);
        if (error.name === "TokenExpiredError" || error.statusCode === 401) {
            const token: string =
                req.cookies?.refreshToken || req.header("Refresh-Token")?.replace("Bearer ", "");
            if (!token) {
                return next(new AppError(401, "Unauthorized Request"));
            }

            try {
                const decodedToken = jwt.verify(
                    token,
                    config.jwt.jwtSecret as Secret
                ) as JwtPayload;

                const user = await User.findOne({
                    _id: decodedToken.userId,
                }).select("-createdAt -updatedAt");
                if (user?.refreshToken !== token) {
                    return next(new AppError(401, "Unauthorized Request"));
                }

                const { accessToken, refreshToken } = generateTokens(
                    new Types.ObjectId(decodedToken.userId)
                );
                user.refreshToken = refreshToken;
                await user.save();
                req.user = user;
                res.cookie("accessToken", accessToken, AUTH_COOKIE_OPTIONS).cookie(
                    "refreshToken",
                    refreshToken,
                    AUTH_COOKIE_OPTIONS
                );
                next();
            } catch (error) {
                console.log(error);
                return next(new AppError(401, "Unauthorized Request"));
            }
        }
    }
});

export default verifyToken;
