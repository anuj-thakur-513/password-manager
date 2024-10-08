import crypto from "crypto";
import config from "../config/keys";

const algorithm = "aes-256-cbc";
const key = Buffer.from(config.crypto.encryptionKey, "hex");

/**
 * Encrypts a text using AES-256-CBC.
 * @param text - The text to be encrypted.
 * @returns An object containing the initialization vector (iv) and encrypted content.
 */
export const encrypt = (text: string): { iv: string; content: string } => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
        iv: iv.toString("hex"),
        content: encrypted,
    };
};

/**
 * Decrypts the given encrypted content using AES-256-CBC.
 * @param encryption - An object containing the initialization vector (iv) and encrypted content.
 * @returns The decrypted original text.
 */
export const decrypt = (encryption: { iv: string; content: string }): string => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryption.iv, "hex"));

    let decrypted = decipher.update(encryption.content, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
