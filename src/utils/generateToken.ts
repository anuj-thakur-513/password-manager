import jwt, { Secret } from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../config/keys";
import Tokens from "../types/tokens";

function generateToken(
  userId: mongoose.Types.ObjectId,
  isRefreshToken: boolean
): string {
  let token: string;
  if (isRefreshToken) {
    token = jwt.sign({ userId }, config.jwt.jwtSecret as Secret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    });
  } else {
    token = jwt.sign({ userId }, config.jwt.jwtSecret as Secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    });
  }
  return token;
}

function generateTokens(userId: mongoose.Types.ObjectId): Tokens {
  const accessToken: string = generateToken(userId, false);
  const refreshToken: string = generateToken(userId, true);

  return { accessToken, refreshToken };
}

export { generateTokens };
