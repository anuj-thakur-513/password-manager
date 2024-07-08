import { Router } from "express";
import userRouter from "./user/userRoutes";
import passwordRouter from "./password/passwordRoutes";

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/password", passwordRouter);

export default v1Router;
