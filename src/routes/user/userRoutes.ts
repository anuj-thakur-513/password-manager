import { Router } from "express";
import {
  handleCheckLoginStatus,
  handleLogin,
  handleLogout,
  handleSignup,
  handleGenerateOtp,
  handleResetOtpGeneration,
  handleVerifyOtp,
  handleResetPassword,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";
import verifyToken from "../../middlewares/authMiddleware";

const userRouter = Router();

userRouter.post("/signup", [rateLimiter, handleSignup]);
userRouter.post("/login", handleLogin);
userRouter.post("/generateOtp", [rateLimiter, verifyToken, handleGenerateOtp]);
userRouter.post("/generate-reset-otp", [rateLimiter, handleResetOtpGeneration]);

userRouter.patch("/resetPassword", [rateLimiter, handleResetPassword]);
userRouter.patch("/verifyOtp", [verifyToken, handleVerifyOtp]);
userRouter.patch("/verify-reset-otp", [rateLimiter, handleVerifyOtp]);

userRouter.get("/logout", handleLogout);
userRouter.get("/checkAuth", [verifyToken, handleCheckLoginStatus]);

export default userRouter;
