FROM imbios/bun-node:latest-current-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY . .

RUN bun install --production

RUN bun --filter=@studify/ws run build

CMD ["bun", "apps/websocket/dist/index.js"]