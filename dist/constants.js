"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_URL = exports.DB_NAME = exports.EMAIL_REGEX = void 0;
exports.EMAIL_REGEX = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
exports.DB_NAME = "password-manager";
exports.SERVER_URL = process.env.BASE_URL;
