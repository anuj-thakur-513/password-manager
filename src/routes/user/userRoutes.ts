import { Request, Response, Router } from "express";
import {
  handleCheckLoginStatus,
  handleLoginManual,
  handleLogout,
  handleRefreshTokens,
  handleSignupManual,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";
import verifyToken from "../../middlewares/authMiddleware";
import passport from "../../config/passportConfig";

const userRouter = Router();

userRouter.post("/manual-signup", [rateLimiter, handleSignupManual]);
userRouter.post("/manual-login", handleLoginManual);

userRouter.get(
  "/google/auth",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
userRouter.get(
  "/google/auth/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173",
    failureRedirect: "http://localhost:5173",
  })
);
userRouter.get("/logout", handleLogout);

userRouter.get("/refresh-tokens", handleRefreshTokens);
userRouter.get("/checkAuth", [verifyToken, handleCheckLoginStatus]);

export default userRouter;
