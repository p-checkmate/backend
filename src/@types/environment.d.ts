declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: number;
            DB_HOST?: string;
            DB_USER?: string;
            DB_PORT?: number;
            DB_NAME?: string;
            DB_PASSWORD?: string;
            ALADIN_API_KEY?: string;
        }
    }
}
