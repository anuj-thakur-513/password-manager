"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../core/AppError"));
const errorHandler = (err, req, res, next) => {
    let error = err;
    error.message = err.message || "Server Error";
    error.statusCode = err.statusCode || 500;
    // Log the full error for debugging purposes
    console.error(err);
    // Handle mongoose bad ObjectID errors (CastError)
    if (err.name === "CastError") {
        const message = `Resource not found with ID: ${err.value}`;
        error = new AppError_1.default(404, message);
    }
    // Handle mongoose duplicate key errors (code 11000)
    if (err.code === 11000 && err.keyValue) {
        const message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
        error = new AppError_1.default(400, message);
    }
    // Handle mongoose validation errors (ValidationError)
    if (err.name === "ValidationError" && err.errors) {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = new AppError_1.default(400, message);
    }
    // Send the final error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server Error",
        statusCode: error.statusCode || 500,
    });
};
exports.default = errorHandler;
