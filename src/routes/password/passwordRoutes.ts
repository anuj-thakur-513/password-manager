import { Router } from "express";
import verifyToken from "../../middlewares/authMiddleware";
import {
    handleAddPassword,
    handleUpdatePassword,
    handleDeletePassword,
    handleGetAllPasswords,
    handleGetPassword,
} from "../../controllers/password/passwordController";
import paginate from "../../middlewares/pagination";

const passwordRouter = Router();

passwordRouter.get("/all", [verifyToken, paginate, handleGetAllPasswords]);
passwordRouter.get("/:platform", [verifyToken, handleGetPassword]);

passwordRouter.post("/add", [verifyToken, handleAddPassword]);

passwordRouter.patch("/update", [verifyToken, handleUpdatePassword]);

passwordRouter.delete("/delete/:passwordId", [verifyToken, handleDeletePassword]);

export default passwordRouter;
