"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    mongoDb: {
        dbUri: process.env.MONGO_URI,
    },
    jwt: {
        jwtSecret: process.env.JWT_SECRET,
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    },
    resend: {
        apiKey: process.env.RESEND_API_KEY,
    },
    redis: {
        url: process.env.REDIS_URL,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        user: process.env.REDIS_USER,
    },
    crypto: {
        encryptionKey: process.env.CRYPTO_ENCRYPTION_KEY || "encryptionKey",
    },
};
exports.default = config;
