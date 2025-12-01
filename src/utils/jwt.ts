import * as jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET: jwt.Secret = process.env.JWT_REFRESH_SECRET as string;

export const generateToken = (payload: any) => {
    const expiresIn = (process.env.JWT_EXPIRES_IN as StringValue) || "1d";

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload: any) => {
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || "7d";

    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};
