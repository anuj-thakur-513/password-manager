import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import AppError from "../core/AppError";
import CustomError from "../types/customError";

const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // log for the developer
  console.log(err);

  // mongoose bad ObjectID
  if (err.name === "CastError") {
    const message = `Resource not found with ID : ${(err as any).value}`;
    error = new AppError(404, message);
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate Field Value entered : ${JSON.stringify(err.message)}`;
    error = new AppError(400, message);
  }

  // mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(400, message.join(", "));
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;
