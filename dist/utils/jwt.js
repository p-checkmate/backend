import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const generateToken = (payload) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
export const generateRefreshToken = (payload) => {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};
