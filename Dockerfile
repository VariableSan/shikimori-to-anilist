FROM node:22.12.0-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

FROM node:22.12.0-alpine AS prod

WORKDIR /app

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["./.output/server/index.mjs"]
