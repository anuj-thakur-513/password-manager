import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import AppError from "../../core/AppError";
import { Password } from "../../models/passwords";
import ApiResponse from "../../core/ApiResponse";

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
    if (!platformName) {
        platformName = platformUrl.split(".")[1];
    }

    const existingData = await Password.findOne({
        platformName: platformName,
        email: email,
        username: username,
    });
    if (existingData) {
        if (
            (username && username === existingData.username) ||
            (email && email === existingData.email)
        ) {
            const data = await Password.updateOne(
                { platformName: platformName },
                {
                    $set: {
                        password: password,
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
        password: password,
    });

    return res.status(201).json(
        new ApiResponse(
            {
                platformName: data.platformName,
                platformUrl: data.platformUrl || "",
                username: data.username || "",
                email: data.email || "",
                password: data.password,
            },
            "Password added successfully"
        )
    );
});

const handleGetAllPasswords = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    const passwords = await Password.find({ user: user?._id })
        .sort({ updatedAt: -1 })
        .select("-_id -__v -user -createdAt -updatedAt")
        .lean();

    return res.status(200).json(new ApiResponse(passwords, "Passwords fetched successfully"));
});

const handleGetPassword = asyncHandler(async (req: Request, res: Response) => {
    const platform = req.params.platform;

    const password = await Password.find({
        platformName: { $regex: platform, $options: "i" },
    })
        .sort({ updatedAt: -1 })
        .select("-_id -__v -user -createdAt -updatedAt")
        .lean();

    return res.status(200).json(new ApiResponse(password, "Password fetched successfully"));
});

const handleDeletePassword = asyncHandler(async (req: Request, res: Response) => {
    const { platformName, username, email } = req.body;
    const user = req.user;
    await Password.findOneAndDelete({
        platformName: platformName,
        username: username,
        email: email,
        user: user?._id,
    });

    return res.status(200).json(new ApiResponse({}, "Password deleted successfully"));
});

export { handleAddPassword, handleGetAllPasswords, handleGetPassword, handleDeletePassword };
