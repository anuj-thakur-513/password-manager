"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const rateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 3, // Limit each IP to 3 requests per `window` (here, per 30 minutes).
    standardHeaders: "draft-7", // draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
exports.rateLimiter = rateLimiter;
