import { request, Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../core/ApiError";
import { EMAIL_REGEX } from "../../constants";
import { User } from "../../models/user";
import { generateTokens } from "../../utils/generateToken";
import ApiResponse from "../../core/ApiResponse";
import { AUTH_COOKIE_OPTIONS } from "../../config/cookiesConfig";
import jwt, { Secret } from "jsonwebtoken";
import config from "../../config/keys";
import JwtPayload from "../../types/jwtPayload";

const handleSignupManual = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (
    [name, email, password].some(
      (field) => field === null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Name, Email & Password are mandatory fields");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Invalid format of email");
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.create({
    name: name,
    email: email,
    password: password,
  });

  if (!user) {
    throw new ApiError(
      500,
      "Error while registering user, please try again later"
    );
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

const handleLoginManual = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (
    [email, password].some((field) => field === null || field.trim() === "")
  ) {
    throw new ApiError(400, "Email and Password are mandatory fields");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Invalid format of email");
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const passwordMatched = await user.isPasswordCorrect(password);
  if (!passwordMatched) {
    throw new ApiError(401, "Password Incorrect");
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

const handleRefreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken || req.headers["authorization"];

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }
    let decodedToken: JwtPayload;
    try {
      decodedToken = jwt.verify(
        token,
        config.jwt.jwtSecret as Secret
      ) as JwtPayload;
    } catch (error: any) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const user = await User.findById(decodedToken.userId).select(
      "-createdAt -updatedAt -password"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.refreshToken !== token) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      { $set: { refreshToken: refreshToken } }
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, AUTH_COOKIE_OPTIONS)
      .cookie("refreshToken", refreshToken, AUTH_COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          {
            updatedAccessToken: accessToken,
            updatedRefreshToken: refreshToken,
          },
          "Tokens regenerated successfully"
        )
      );
  }
);

const handleCheckLoginStatus = (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(null, "User is Logged In"));
};

const handleLogout = asyncHandler(async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        throw new ApiError(500, "Failed to logout google user");
      }
      req.session.destroy((err) => {
        if (err) {
          throw new ApiError(500, "Failed to logout google user");
        }
        res.clearCookie("connect.sid", { path: "/" });
        return res
          .status(200)
          .json(new ApiResponse({}, "Logged out google auth successfully"));
      });
    });
  } else {
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(new ApiResponse({}, "Logged out successfully"));
  }
});

export {
  handleSignupManual,
  handleLoginManual,
  handleRefreshTokens,
  handleCheckLoginStatus,
  handleLogout,
};
