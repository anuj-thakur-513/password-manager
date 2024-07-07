import { Router } from "express";
import {
  handleLoginManual,
  handleSignupManual,
} from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";

const userRouter = Router();

userRouter.post("/manual-signup", [rateLimiter, handleSignupManual]);
userRouter.post("/manual-login", handleLoginManual);

export default userRouter;
