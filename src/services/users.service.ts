import bcrypt from "bcrypt";
import HttpError from "http-errors";
import {
    LoginInput,
    LoginOutput,
    RefreshTokenInput,
    RefreshTokenOutput,
    SignupOutput,
} from "../schemas/users.schema.js";
import {
    getUserByEmail,
    saveRefreshToken,
    getRefreshTokenByToken,
    deleteRefreshToken,
    createUser,
    deleteUser,
} from "../repositories/users.repository.js";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// 로그인
export const userLogin = async (input: LoginInput): Promise<LoginOutput> => {
    // 이메일로 사용자 찾기
    const user = await getUserByEmail(input.email);
    if (!user) {
        throw HttpError(401, "이메일이 일치하지 않습니다.");
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw HttpError(401, "비밀번호가 일치하지 않습니다.");
    }

    // 토큰 생성
    const accessToken = generateToken({
        user_id: user.user_id,
    });
    const refreshToken = generateRefreshToken({
        user_id: user.user_id,
    });

    // 리프레시 토큰 저장
    await saveRefreshToken(user.user_id, refreshToken);

    // 응답 반환
    return {
        accessToken,
        refreshToken,
        user: {
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_url: user.profile_url,
        },
    };
};

// 리프레시 토큰으로 액세스 토큰 재발급
export const refreshAccessToken = async (input: RefreshTokenInput): Promise<RefreshTokenOutput> => {
    try {
        // Refresh token 검증 (만료 체크 자동)
        const decoded = verifyRefreshToken(input.refreshToken) as {
            user_id: number;
        };

        // DB에서 토큰 존재 여부 확인
        const tokenRecord = await getRefreshTokenByToken(input.refreshToken);

        if (!tokenRecord) {
            throw HttpError(401, "유효하지 않은 리프레시 토큰입니다.");
        }

        // user_id 일치 여부 확인
        if (tokenRecord.user_id !== decoded.user_id) {
            throw HttpError(401, "유효하지 않은 리프레시 토큰입니다.");
        }

        // 새 access token 발급
        const accessToken = generateToken({
            user_id: tokenRecord.user_id,
        });

        return { accessToken };
    } catch (error: any) {
        // 토큰 만료 시
        if (error.name === "TokenExpiredError") {
            // DB에서 삭제
            await deleteRefreshToken(input.refreshToken);
            throw HttpError(401, "리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
        }

        // 검증 실패 시
        if (error.name === "JsonWebTokenError") {
            throw HttpError(401, "유효하지 않은 리프레시 토큰입니다.");
        }

        // 기타 에러
        throw error;
    }
};

export const userSignup = async (input: LoginInput): Promise<SignupOutput> => {
    // 사용자 중복 검사
    const isDuplicated = await getUserByEmail(input.email);
    if (isDuplicated) {
        throw HttpError(409, "이미 존재하는 이메일입니다.");
    }

    const password = await bcrypt.hash(input.password, 10);

    const user = await createUser(input.email, password);

    if (!user) {
        throw HttpError(500, "사용자 생성에 실패했습니다.");
    }

    // 토큰 생성
    const accessToken = generateToken({
        user_id: user.user_id,
    });
    const refreshToken = generateRefreshToken({
        user_id: user.user_id,
    });

    // 리프레시 토큰 저장
    await saveRefreshToken(user.user_id, refreshToken);

    // 응답 반환
    return {
        accessToken,
        refreshToken,
        user: {
            user_id: user.user_id,
            email: user.email,
        },
    };
};

export const userWithdrawal = async (userId: number): Promise<string> => {
    const rows = await deleteUser(userId);

    if (rows === 1) {
        return "회원탈퇴가 완료되었습니다.";
    } else {
        throw HttpError(404, "사용자를 찾을 수 없습니다. 회원탈퇴에 실패했습니다.");
    }
};
