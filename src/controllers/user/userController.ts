import { NextFunction, Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler";
import AppError from "../../core/AppError";
import { EMAIL_REGEX } from "../../constants";
import { User } from "../../models/user";
import { generateTokens } from "../../utils/generateToken";
import ApiResponse from "../../core/ApiResponse";
import { AUTH_COOKIE_OPTIONS } from "../../config/cookiesConfig";

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
  await User.updateOne(
    { _id: user._id },
    {
      $set: { refreshToken: refreshToken },
    }
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, AUTH_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, AUTH_COOKIE_OPTIONS)
    .json(new ApiResponse({}, "User registered successfully"));
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
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        refreshToken: refreshToken,
      },
    }
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse({}, "Logged in successfully"));
});

const handleCheckLoginStatus = (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(null, "User is Logged In"));
};

const handleLogout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse({}, "Logged out successfully"));
});

export { handleSignup, handleLogin, handleCheckLoginStatus, handleLogout };
