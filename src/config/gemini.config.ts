// src/config/gemini.config.ts

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";

dotenv.config();


export const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: process.env.VERTEXAI_LOCATION || "us-asia-northeast3 ", 
});
