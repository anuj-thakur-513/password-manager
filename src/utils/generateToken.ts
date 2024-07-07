import jwt, { Jwt, Secret } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import config from "../config/keys";

function generateToken(userId: ObjectId, isRefreshToken: boolean) {
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

export default generateToken;
