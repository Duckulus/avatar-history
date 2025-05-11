FROM node:23

WORKDIR /app

COPY . .

RUN yarn

CMD ["yarn", "deploy"]