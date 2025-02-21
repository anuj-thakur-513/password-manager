"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(statusCode = 500, message = "Something went wrong", errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.stack = stack;
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.default = AppError;
