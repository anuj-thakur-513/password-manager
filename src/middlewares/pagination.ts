import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";

const paginate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    req.query.limit = limit.toString();
    req.query.page = page.toString();
    next();
});

export default paginate;
