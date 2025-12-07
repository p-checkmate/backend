import dotenv from 'dotenv';
dotenv.config();
function getEnvVariable(key) {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`환경변수 ${key}가 정의되지 않았습니다.`);
    }
    return value;
}
export const aladinConfig = {
    ALADIN_API_KEY: getEnvVariable('ALADIN_API_KEY'),
    ALADIN_BASE_URL: 'http://www.aladin.co.kr/ttb/api',
};
