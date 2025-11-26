import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_PORT_NUMBER = +(process.env.DB_PORT || 3306);

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost", // mysql의 hostname
    user: process.env.DB_USER || "root", // user 이름
    port: DB_PORT_NUMBER, // 포트 번호
    database: process.env.DB_NAME || "checkmate_test", // 데이터베이스 이름
    password: process.env.DB_PASSWORD, // 비밀번호
    waitForConnections: true, // 획득할 수 있는 connection이 없을 때 대기할지 여부
    connectionLimit: 10, // 몇 개의 커넥션을 가지게끔 할 것인지
    queueLimit: 0, // getConnection에서 오류가 발생하기 전에 Pool에 대기할 요청의 개수 한도
});
