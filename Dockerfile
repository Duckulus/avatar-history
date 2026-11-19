# syntax=docker/dockerfile:1

# Small runtime image with stable dependency layers: updating the app should only
# download the few MB of build output, not gigabytes of node_modules. Unpacking
# huge layers on every pull has frozen the production server before.

FROM node:26-slim AS base
# node >= 25 images no longer ship yarn; prisma needs openssl
RUN npm install -g yarn@1.22.22 \
    && apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Only what dependency installation needs, so the install layers stay cached
# until package.json, yarn.lock or the prisma schema change
FROM base AS manifests
COPY package.json yarn.lock turbo.json ./
COPY apps/cdn/package.json apps/cdn/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/db/prisma/schema.prisma packages/db/prisma/
COPY packages/discord/package.json packages/discord/
COPY packages/env/package.json packages/env/
COPY packages/logging/package.json packages/logging/
COPY packages/tsconfig/package.json packages/tsconfig/

FROM manifests AS build
RUN yarn --frozen-lockfile
COPY . .
RUN yarn workspace @avatar-history/db prisma generate \
    && yarn build \
    && rm -rf apps/web/.next/cache

FROM manifests AS runtime
RUN yarn --frozen-lockfile --production \
    && yarn workspace @avatar-history/db prisma generate \
    && yarn cache clean
COPY --from=build /app/packages/db/dist packages/db/dist
COPY --from=build /app/packages/discord/dist packages/discord/dist
COPY --from=build /app/packages/env/dist packages/env/dist
COPY --from=build /app/packages/logging/dist packages/logging/dist
COPY --from=build /app/apps/cdn/dist apps/cdn/dist
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/apps/web/.next apps/web/.next
COPY apps/web/public apps/web/public
COPY apps/web/next.config.js apps/web/

# applies schema changes to the mounted sqlite db, then starts the prebuilt apps.
# Runtime config (.env) is read when the container starts, not baked in here.
CMD ["yarn", "deploy"]
