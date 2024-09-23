FROM oven/bun:1.1.27-alpine

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install

COPY tsconfig.json ./
COPY ./src ./src

CMD ["bun", "start"]
