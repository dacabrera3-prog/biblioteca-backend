FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src/

RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package*.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
