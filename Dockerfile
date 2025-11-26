# Build Stage
FROM node:20 AS builder

WORKDIR /app

# 1. 의존성 복사 및 설치 (캐시 활용)
# package.json만 먼저 복사하여 npm install 캐싱을 극대화
COPY package*.json ./
RUN npm install

# 2. 소스 코드 복사
COPY . .

# 3. 코드 빌드
RUN npm run build


# Production Stage
FROM node:20-slim AS production

WORKDIR /app

# 1. 의존성 복사
# production 환경에서 필요한 node_modules만 복사
COPY --from=builder /app/node_modules ./node_modules

# 2. 컴파일된 코드 및 필요한 파일 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 3. 포트 노출
EXPOSE 3000

# 4. 애플리케이션 시작
CMD ["npm", "start"]