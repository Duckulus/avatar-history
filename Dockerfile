FROM node:23

WORKDIR /app

COPY . .

RUN yarn

RUN yarn db generate

RUN yarn build

CMD ["yarn", "deploy"]