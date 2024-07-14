import e, { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../core/ApiError";
import { Password } from "../../models/passwords";
import ApiResponse from "../../core/ApiResponse";
import { getCache, setCache } from "../../services/redis";
import PasswordType from "../../types/password";

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

  const cacheKey = user?._id.toString() || "";
  const cacheData = await getCache(cacheKey);

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
      await Password.updateOne(
        { websiteName: websiteName },
        {
          $set: {
            password: password,
          },
        }
      );

      const updatedData = await Password.findById(existingData._id);
      if (cacheData) {
        const updatedCacheData = cacheData.map((entry) => {
          if (entry.websiteName === websiteName) {
            return { ...entry, password: password };
          }
          return entry;
        });

        await setCache(cacheKey, updatedCacheData, 60 * 60 * 1000);
      }

      return res.status(200).json(
        new ApiResponse(
          {
            websiteName: updatedData && updatedData.websiteName,
            websiteUrl: (updatedData && updatedData.websiteUrl) || "",
            username: (updatedData && updatedData.username) || "",
            email: (updatedData && updatedData.email) || "",
            password: updatedData && updatedData.password,
          },
          "Password updated successfully"
        )
      );
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

  if (cacheData) {
    cacheData.push({
      websiteName: websiteName,
      websiteUrl: websiteUrl === "" ? undefined : websiteUrl,
      email: email === "" ? undefined : email,
      username: username === "" ? undefined : username,
      password: password,
    });

    await setCache(cacheKey, cacheData, 60 * 60 * 1000);
  }

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

const handleGetAllPasswords = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const cacheKey = user?._id.toString() || "";
    let passwords: PasswordType[] | null = await getCache(cacheKey);
    if (!passwords) {
      passwords = await Password.find({ user: user?._id })
        .sort({ updatedAt: -1 })
        .select("-_id -__v -user -createdAt -updatedAt")
        .lean();

      if (passwords && passwords.length > 0)
        await setCache(cacheKey, passwords, 60 * 60 * 1000);
    }
    return res
      .status(200)
      .json(new ApiResponse(passwords, "Passwords fetched successfully"));
  }
);

const handleGetPassword = asyncHandler(async (req: Request, res: Response) => {
  const website = req.params.website;
  const cacheKey = req.user?._id.toString() || "";
  let passwords: PasswordType[] | null = await getCache(cacheKey);
  let password: PasswordType | null = null;
  if (!passwords) {
    password = await Password.find({
      websiteName: { $regex: website, $options: "i" },
    })
      .sort({ updatedAt: -1 })
      .select("-_id -__v -user -createdAt -updatedAt")
      .lean();
  } else {
    password =
      passwords.find((val) => new RegExp(website, "i").test(val.websiteName)) ||
      null;
  }

  return res
    .status(200)
    .json(new ApiResponse(password, "Password fetched successfully"));
});

const handleDeletePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { websiteName, username, email } = req.body;
    const user = req.user;
    await Password.findOneAndDelete({
      websiteName: websiteName,
      username: username,
      email: email,
      user: user?._id,
    });
    const cacheKey = user?._id.toString() || "";
    let passwords: PasswordType[] | null = await getCache(cacheKey);
    if (passwords) {
      passwords = passwords.filter((val) => {
        val.email !== email ||
          val.username !== username ||
          val.websiteName !== websiteName;
      });

      await setCache(cacheKey, passwords, 60 * 60 * 1000);
    }

    return res
      .status(200)
      .json(new ApiResponse({}, "Password deleted successfully"));
  }
);

export {
  handleAddPassword,
  handleGetAllPasswords,
  handleGetPassword,
  handleDeletePassword,
};
