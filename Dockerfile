# 프론트엔드 Dockerfile
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY . .

# 환경변수 설정
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net

# Next.js 애플리케이션 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "start"]
