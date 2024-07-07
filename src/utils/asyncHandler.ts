import AsyncFunction from "../types/asyncFunction";
import { Request, Response, NextFunction } from "express";

function asyncHandler(asyncFunction: AsyncFunction) {
  return function (req: Request, res: Response, next: NextFunction) {
    asyncFunction(req, res, next).catch(next);
  };
}

export default asyncHandler;
