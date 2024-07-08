import { Router } from "express";
import verifyToken from "../../middlewares/authMiddleware";
import {
  handleAddPassword,
  handleGetAllPasswords,
} from "../../controllers/password/passwordController";

const passwordRouter = Router();

passwordRouter.post("/add", [verifyToken, handleAddPassword]);
passwordRouter.get("/all", [verifyToken, handleGetAllPasswords]);

export default passwordRouter;
