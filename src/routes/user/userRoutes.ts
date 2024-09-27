import { Router } from "express";
import {
  handleCheckLoginStatus,
  handleLogin,
  handleLogout,
  handleSignup,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";
import verifyToken from "../../middlewares/authMiddleware";

const userRouter = Router();

userRouter.post("/signup", [rateLimiter, handleSignup]);
userRouter.post("/login", handleLogin);
userRouter.get("/logout", handleLogout);
userRouter.get("/checkAuth", [verifyToken, handleCheckLoginStatus]);

export default userRouter;
