import { Router } from "express";
import {
  handleCheckLoginStatus,
  handleLoginManual,
  handleRefreshTokens,
  handleSignupManual,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";
import verifyToken from "../../middlewares/authMiddleware";

const userRouter = Router();

userRouter.post("/manual-signup", [rateLimiter, handleSignupManual]);
userRouter.post("/manual-login", handleLoginManual);
userRouter.post("/refresh-tokens", handleRefreshTokens);

userRouter.get("/checkAuth", [verifyToken, handleCheckLoginStatus]);

export default userRouter;
