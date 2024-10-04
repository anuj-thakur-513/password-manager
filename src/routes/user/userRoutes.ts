import { Router } from "express";
import {
  handleCheckLoginStatus,
  handleLogin,
  handleLogout,
  handleSignup,
  handleGenerateOtp,
  handleVerifyOtp,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";
import verifyToken from "../../middlewares/authMiddleware";

const userRouter = Router();

userRouter.post("/signup", [rateLimiter, handleSignup]);
userRouter.post("/login", handleLogin);
userRouter.get("/logout", handleLogout);
userRouter.get("/checkAuth", [verifyToken, handleCheckLoginStatus]);
userRouter.post("/generateOtp", [verifyToken, handleGenerateOtp]); // add rate limiter
userRouter.patch("/verifyOtp", [verifyToken, handleVerifyOtp]);

export default userRouter;
