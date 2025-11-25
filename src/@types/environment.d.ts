declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: number;
            DATABASE_URL?: string;
            DB_HOST?: string;
            DB_USER?: string;
            DB_PORT?: string;
            DB_NAME?: string;
            DB_PASSWORD?: string;
        }
    }
}
