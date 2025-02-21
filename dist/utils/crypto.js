"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const keys_1 = __importDefault(require("../config/keys"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(keys_1.default.crypto.encryptionKey, "hex");
/**
 * Encrypts a text using AES-256-CBC.
 * @param text - The text to be encrypted.
 * @returns An object containing the initialization vector (iv) and encrypted content.
 */
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
        iv: iv.toString("hex"),
        content: encrypted,
    };
};
exports.encrypt = encrypt;
/**
 * Decrypts the given encrypted content using AES-256-CBC.
 * @param encryption - An object containing the initialization vector (iv) and encrypted content.
 * @returns The decrypted original text.
 */
const decrypt = (encryption) => {
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, Buffer.from(encryption.iv, "hex"));
    let decrypted = decipher.update(encryption.content, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
exports.decrypt = decrypt;
