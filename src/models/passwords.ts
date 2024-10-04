import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const passwordSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        websiteUrl: {
            type: String,
        },
        websiteName: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
        },
        username: {
            type: String,
        },
        email: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

passwordSchema.pre("save", async function (next): Promise<void> {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const Password = mongoose.model("password", passwordSchema);
