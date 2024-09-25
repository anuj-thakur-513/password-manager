import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../core/ApiError";
import { Password } from "../../models/passwords";
import ApiResponse from "../../core/ApiResponse";

const handleAddPassword = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const { username, email, password } = req.body;
    const websiteUrl: string = req.body.websiteUrl;
    let websiteName: string = req.body.websiteName;
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!websiteUrl && !websiteName) {
        throw new ApiError(400, "Website URL or Website Name is required");
    }
    if (!websiteName) {
        websiteName = websiteUrl.split(".")[1];
    }

    const existingData = await Password.findOne({
        websiteName: websiteName,
        email: email,
        username: username,
    });
    if (existingData) {
        if (
            (username && username === existingData.username) ||
            (email && email === existingData.email)
        ) {
            const data = await Password.updateOne(
                { websiteName: websiteName },
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
        websiteUrl: websiteUrl === "" ? null : websiteUrl,
        websiteName: websiteName,
        username: username === "" ? null : username,
        email: email === "" ? null : email,
        password: password,
    });

    return res.status(201).json(
        new ApiResponse(
            {
                websiteName: data.websiteName,
                websiteUrl: data.websiteUrl || "",
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
    const website = req.params.website;

    const password = await Password.find({
        websiteName: { $regex: website, $options: "i" },
    })
        .sort({ updatedAt: -1 })
        .select("-_id -__v -user -createdAt -updatedAt")
        .lean();

    return res.status(200).json(new ApiResponse(password, "Password fetched successfully"));
});

const handleDeletePassword = asyncHandler(async (req: Request, res: Response) => {
    const { websiteName, username, email } = req.body;
    const user = req.user;
    await Password.findOneAndDelete({
        websiteName: websiteName,
        username: username,
        email: email,
        user: user?._id,
    });

    return res.status(200).json(new ApiResponse({}, "Password deleted successfully"));
});

export { handleAddPassword, handleGetAllPasswords, handleGetPassword, handleDeletePassword };
