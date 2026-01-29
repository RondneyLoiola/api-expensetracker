FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm install -D typescript
RUN npx tsc || echo

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]