FROM node:26

WORKDIR /app

COPY . .

RUN yarn

CMD ["yarn", "deploy"]