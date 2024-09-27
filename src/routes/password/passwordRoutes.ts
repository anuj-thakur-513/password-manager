import { Router } from "express";
import verifyToken from "../../middlewares/authMiddleware";
import {
  handleAddPassword,
  handleDeletePassword,
  handleGetAllPasswords,
  handleGetPassword,
} from "../../controllers/password/passwordController";

const passwordRouter = Router();

passwordRouter.post("/add", [verifyToken, handleAddPassword]);
passwordRouter.get("/all", [verifyToken, handleGetAllPasswords]);
passwordRouter.get("/:website", [verifyToken, handleGetPassword]);
passwordRouter.delete("/delete", [verifyToken, handleDeletePassword]);

export default passwordRouter;
