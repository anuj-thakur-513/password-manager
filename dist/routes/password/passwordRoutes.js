"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const passwordController_1 = require("../../controllers/password/passwordController");
const pagination_1 = __importDefault(require("../../middlewares/pagination"));
const passwordRouter = (0, express_1.Router)();
passwordRouter.get("/all", [authMiddleware_1.default, pagination_1.default, passwordController_1.handleGetAllPasswords]);
passwordRouter.get("/:platform", [authMiddleware_1.default, passwordController_1.handleGetPassword]);
passwordRouter.post("/add", [authMiddleware_1.default, passwordController_1.handleAddPassword]);
passwordRouter.patch("/update", [authMiddleware_1.default, passwordController_1.handleUpdatePassword]);
passwordRouter.delete("/delete/:passwordId", [authMiddleware_1.default, passwordController_1.handleDeletePassword]);
exports.default = passwordRouter;
