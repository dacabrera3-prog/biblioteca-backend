FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src/

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL npx prisma migrate deploy && node dist/src/main"]
