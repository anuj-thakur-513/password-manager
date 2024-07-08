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

  const existingData = await Password.findOne({ websiteName: websiteName });
  if (existingData) {
    if (username === existingData.username) {
      const updatedData = await Password.updateOne(
        { websiteName: websiteName },
        {
          $set: {
            password: password,
          },
        }
      ).select("-createdAt -updatedAt");
    }

    return res.status(200).json(
      new ApiResponse(
        {
          websiteName: websiteName,
          websiteUrl: websiteUrl || "",
          username: username || "",
          email: email || "",
          password: password,
        },
        "Password updated successfully"
      )
    );
  }

  const data = await Password.create({
    user: user?._id,
    websiteUrl: websiteUrl,
    websiteName: websiteName,
    username: username,
    email: email,
    password: password,
  });

  return res.status(201).json({
    websiteName: websiteName,
    websiteUrl: websiteUrl || "",
    username: username || "",
    email: email || "",
    password: password,
  });
});

export { handleAddPassword };
