FROM node:23

WORKDIR /app

COPY . .

RUN yarn

RUN yarn build

CMD ["yarn", "deploy"]