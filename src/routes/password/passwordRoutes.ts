import { Router } from "express";
import verifyToken from "../../middlewares/authMiddleware";
import {
    handleAddPassword,
    handleUpdatePassword,
    handleDeletePassword,
    handleGetAllPasswords,
    handleGetPassword,
} from "../../controllers/password/passwordController";

const passwordRouter = Router();

passwordRouter.get("/all", [verifyToken, handleGetAllPasswords]);
passwordRouter.get("/:website", [verifyToken, handleGetPassword]);

passwordRouter.post("/add", [verifyToken, handleAddPassword]);

passwordRouter.patch("/update", [verifyToken, handleUpdatePassword]);

passwordRouter.delete("/delete/:passwordId", [verifyToken, handleDeletePassword]);

export default passwordRouter;
