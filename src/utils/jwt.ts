import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (payload: any) => {
    const secret: string = process.env.JWT_SECRET as string;
    const expiresIn: string = process.env.JWT_EXPIRES_IN || "1h";

    return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload: any) => {
    const secret = process.env.JWT_REFRESH_SECRET as string;
    const expiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string) => {
    const secret = process.env.JWT_SECRET as string;
    return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token: string) => {
    const secret = process.env.JWT_REFRESH_SECRET as string;
    return jwt.verify(token, secret);
};
