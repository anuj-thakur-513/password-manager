import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import AppError from "../../core/AppError";
import { Password } from "../../models/passwords";
import ApiResponse from "../../core/ApiResponse";
import { encrypt, decrypt } from "../../utils/crypto";
import decryptedPassword from "../../types/decryptedPassword";

const handleAddPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { username, email, password } = req.body;
    const platformUrl: string = req.body.platformUrl;
    let platformName: string = req.body.platformName;
    if (!username && !email) {
        return next(new AppError(400, "Username or email is required"));
    }
    if (!platformUrl && !platformName) {
        return next(new AppError(400, "Platform URL or Platform Name is required"));
    }

    if (!password) {
        return next(new AppError(400, "Password is required"));
    }

    if (!platformName) {
        platformName = platformUrl.split(".")[1];
    }

    const encryptedPassword = encrypt(password);

    const existingData = await Password.findOne({
        platformName: platformName,
        email: email,
        username: username,
    });
    if (existingData) {
        if ((username && username === existingData.username) || (email && email === existingData.email)) {
            const data = await Password.updateOne(
                { platformName: platformName },
                {
                    $set: {
                        password: encryptedPassword,
                    },
                },
                {
                    new: true,
                }
            ).select("-_id -__v -user -createdAt -updatedAt");

            return res.status(200).json(new ApiResponse(data, "Password updated successfully"));
        }
    }

    const data = await Password.create({
        user: user?._id,
        platformUrl: platformUrl === "" ? null : platformUrl,
        platformName: platformName,
        username: username === "" ? null : username,
        email: email === "" ? null : email,
        password: encryptedPassword,
    });

    return res.status(201).json(
        new ApiResponse(
            {
                platformName: data.platformName,
                platformUrl: data.platformUrl || "",
                username: data.username || "",
                email: data.email || "",
                password: password,
            },
            "Password added successfully"
        )
    );
});

const handleUpdatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { platformName, platformUrl, username, email, password } = req.body;
    if (!platformName && !platformUrl) {
        return next(new AppError(400, "Platform Name or Platform URL is required"));
    }
    if (!username && !email) {
        return next(new AppError(400, "Username or email is required"));
    }
    if (!password) {
        return next(new AppError(400, "Password is required"));
    }

    const dbPassword = await Password.findOne({
        user: user?._id,
        ...(platformName && { platformName }),
        ...(platformUrl && { platformUrl }),
        ...(username && { username }),
        ...(email && { email }),
    });
    if (!dbPassword) {
        return next(new AppError(404, "Password not found"));
    }

    const encryptedPassword = encrypt(password);
    dbPassword.password = encryptedPassword;
    await dbPassword.save();

    return res.status(200).json(
        new ApiResponse(
            {
                platformName: platformName,
                platformUrl: platformUrl || "",
                username: username || "",
                email: email || "",
                password: password,
            },
            "Password updated successfully"
        )
    );
});

const handleGetAllPasswords = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { limit, page } = req.query;
    if (!limit && !page) {
        return next(new AppError(400, "Skip, limit & page are required"));
    }

    const passwords = await Password.find({ user: user?._id })
        .sort({ updatedAt: -1 })
        .select("-__v -user -createdAt -updatedAt")
        .lean();

    // pagination
    const totalPasswords = passwords.length;
    const limitInt = parseInt(limit as string) || 10;
    const pageInt = parseInt(page as string) || 1;
    const totalPages = Math.ceil(totalPasswords / limitInt);
    if (pageInt > totalPages) {
        return next(new AppError(400, "Page number is greater than total pages"));
    }
    const start = (pageInt - 1) * limitInt;
    const end = start + limitInt;
    const passwordsSlice = passwords.slice(start, end);

    const data: decryptedPassword[] = [];
    passwordsSlice.forEach((password) => {
        if (password.password) {
            const decryptedPassword = decrypt(password.password);
            data.push({
                ...password,
                password: decryptedPassword,
            });
        }
    });

    return res.status(200).json(new ApiResponse({ data, totalPages }, "Passwords fetched successfully"));
});

const handleGetPassword = asyncHandler(async (req: Request, res: Response) => {
    const platform = req.params.platform;

    const passwords = await Password.find({
        platformName: { $regex: platform, $options: "i" },
    })
        .sort({ updatedAt: -1 })
        .select("-__v -user -createdAt -updatedAt")
        .lean();

    const data: decryptedPassword[] = [];
    passwords.forEach((password) => {
        if (password.password) {
            const decryptedPassword = decrypt(password.password);
            data.push({
                ...password,
                password: decryptedPassword,
            });
        }
    });

    return res.status(200).json(new ApiResponse(data, "Password fetched successfully"));
});

const handleDeletePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { passwordId } = req.params;
    if (!passwordId) {
        return next(new AppError(400, "Password ID is required"));
    }
    await Password.findByIdAndDelete(passwordId);
    return res.status(200).json(new ApiResponse({}, "Password deleted successfully"));
});

export {
    handleAddPassword,
    handleUpdatePassword,
    handleGetAllPasswords,
    handleGetPassword,
    handleDeletePassword,
};
