import { writeFileSync } from "fs";
import { Documentation } from "express-zod-api";
import { apiConfig } from "../src/config/api.config.js";
import { routing } from "../src/routes/routes.index.js";

// API 문서 생성 (JSON 형식)
const documentation = new Documentation({
    routing,
    config: apiConfig,
    version: "1.0.0",
    title: "Checkmate API",
    serverUrl: "http://localhost:3000",
    composition: "inline",
});

const jsonSpec = documentation.getSpecAsJson();
writeFileSync("./openapi.json", jsonSpec, "utf-8");

console.log("OpenAPI spec generated: openapi.json");
console.log("View at: https://editor.swagger.io/");
