import { Router } from "express";
import verifyToken from "../../middlewares/authMiddleware";
import { handleAddPassword } from "../../controllers/password/passwordController";

const passwordRouter = Router();

passwordRouter.post("/add", [verifyToken, handleAddPassword]);

export default passwordRouter;
