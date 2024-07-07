import { Router } from "express";
import { handleSignupManual } from "../../controllers/user/userController";
import { rateLimiter } from "../../middlewares/rateLimiter";

const userRouter = Router();

userRouter.post("/manual-signup", [rateLimiter, handleSignupManual]);

export default userRouter;
