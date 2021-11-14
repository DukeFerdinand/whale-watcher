FROM node:16-buster

WORKDIR /discord-bot

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Files required by pnpm install
COPY package.json pnpm-lock.yaml  ./

RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

CMD ["node", "dist/main.js"]