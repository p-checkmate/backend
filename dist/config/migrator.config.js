import dotenv from "dotenv";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";
import * as fs from "fs";
dotenv.config();
const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
        multipleStatements: true,
    },
    logging: false,
});
// Umzug 인스턴스 설정
const umzug = new Umzug({
    migrations: {
        glob: "migrations/*.up.sql",
        resolve: ({ name, path: filePath }) => {
            return {
                name,
                up: async () => {
                    if (!filePath)
                        throw new Error("File path is required");
                    const sql = fs.readFileSync(filePath).toString();
                    return sequelize.query(sql);
                },
                down: async () => {
                    if (!filePath)
                        throw new Error("File path is required");
                    const downPath = filePath.replace(".up.sql", ".down.sql");
                    if (!fs.existsSync(downPath)) {
                        throw new Error(`Down migration file not found: ${downPath}`);
                    }
                    const sql = fs.readFileSync(downPath).toString();
                    return sequelize.query(sql);
                },
            };
        },
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
    create: {
        folder: "migrations",
        template: (filepath) => {
            const upPath = filepath;
            const downPath = filepath.replace(".up.sql", ".down.sql");
            return [
                [upPath, "-- Write your migration SQL here\n"],
                [downPath, "-- Write your rollback SQL here\n"],
            ];
        },
    },
});
umzug.runAsCLI();
