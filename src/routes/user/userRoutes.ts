import { Router } from "express";
import {
  handleLoginManual,
  handleRefreshTokens,
  handleSignupManual,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";

const userRouter = Router();

userRouter.post("/manual-signup", [rateLimiter, handleSignupManual]);
userRouter.post("/manual-login", handleLoginManual);
userRouter.post("/refresh-tokens", handleRefreshTokens);

export default userRouter;
