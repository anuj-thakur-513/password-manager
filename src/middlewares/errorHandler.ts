import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import AppError from "../core/AppError";
import CustomError from "../types/customError";

const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: CustomError = err;

  error.message = err.message || "Server Error";
  error.statusCode = err.statusCode || 500;

  // Log the full error for debugging purposes
  console.error(err);

  // Handle mongoose bad ObjectID errors (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with ID: ${(err as any).value}`;
    error = new AppError(404, message);
  }

  // Handle mongoose duplicate key errors (code 11000)
  if (err.code === 11000 && err.keyValue) {
    const message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
    error = new AppError(400, message);
  }

  // Handle mongoose validation errors (ValidationError)
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    error = new AppError(400, message);
  }

  // Send the final error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    statusCode: error.statusCode || 500,
  });
};

export default errorHandler;
