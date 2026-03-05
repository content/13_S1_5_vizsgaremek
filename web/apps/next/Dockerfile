FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./

COPY apps ./apps
COPY packages ./packages

ENV npm_config_platform=linux
ENV npm_config_arch=x64
RUN pnpm install
RUN pnpm rebuild sharp

WORKDIR /app/apps/next

RUN pnpm build

CMD ["pnpm", "start"]