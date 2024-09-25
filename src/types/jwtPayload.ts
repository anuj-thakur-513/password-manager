import jwt from "jsonwebtoken";

interface JwtPayload extends jwt.JwtPayload {
    userId: string;
}

export default JwtPayload;
