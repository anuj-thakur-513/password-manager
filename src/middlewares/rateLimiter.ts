import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  limit: 100, // Limit each IP to 3 requests per `window` (here, per 30 minutes).
  standardHeaders: "draft-7", // draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

export { rateLimiter };
