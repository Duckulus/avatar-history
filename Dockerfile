FROM node:26

# node >= 25 images no longer ship yarn
RUN npm install -g yarn@1.22.22

WORKDIR /app

COPY . .

# Build everything at image build time so containers start without compiling.
# Runtime config (.env) is read when the container starts, not baked in here.
RUN yarn --frozen-lockfile \
    && yarn workspace @avatar-history/db prisma generate \
    && yarn build

# applies schema changes to the mounted sqlite db, then starts the prebuilt apps
CMD ["yarn", "deploy"]
