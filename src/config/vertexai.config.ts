// config/vertexai.config.ts

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";

dotenv.config();

// Vertex AI 초기화
export const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: "us-central1",
});
