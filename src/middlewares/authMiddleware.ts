import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../core/ApiError";
import config from "../config/keys";
import { User } from "../models/user";
import JwtPayload from "../types/jwtPayload";
import axios from "axios";
import { SERVER_URL } from "../constants";
import { AUTH_COOKIE_OPTIONS } from "../config/cookiesConfig";

const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "No access token found");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        config.jwt.jwtSecret as Secret
      ) as JwtPayload;
      const user = await User.findById(decodedToken.userId).select(
        "-password -refreshToken -createdAt -updatedAt"
      );
      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError" || error.statusCode === 401) {
        const token: string =
          req.cookies?.refreshToken ||
          req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
          throw new ApiError(401, "Unauthorized Request");
        }

        try {
          const response = await axios.post(
            `${SERVER_URL}/api/v1/user/refresh-tokens`,
            {},
            {
              headers: {
                authorization: token,
              },
            }
          );

          const { updatedAccessToken, updatedRefreshToken } =
            response?.data?.data;

          const decodedToken = jwt.verify(
            updatedAccessToken,
            config.jwt.jwtSecret as Secret
          ) as JwtPayload;

          const user = await User.findById(decodedToken.userId);
          if (!user) {
            throw new ApiError(401, "Unauthorized Request");
          }

          req.user = user;
          res
            .cookie("accessToken", updatedAccessToken, AUTH_COOKIE_OPTIONS)
            .cookie("refreshToken", updatedRefreshToken, AUTH_COOKIE_OPTIONS);
          next();
        } catch (error: any) {
          throw new ApiError(401, "Unable to refresh access token");
        }
      } else {
        throw new ApiError(401, error.message || "Invalid Access Token");
      }
    }
  }
);

export default verifyToken;
