FROM node:26

# node >= 25 images no longer ship yarn
RUN npm install -g yarn@1.22.22

WORKDIR /app

COPY . .

RUN yarn

CMD ["yarn", "deploy"]
