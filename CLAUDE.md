# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Backs up the Discord avatar and username history of all members of one Discord server (`GUILD_ID`). Avatars are downloaded to disk and served by a static CDN. Data lives in a local SQLite database. A Next.js site lets signed-in users view their own history, and a Discord bot offers slash and user-context commands.

## Commands

Yarn 1 workspaces + Turborepo, Node >= 26. Run everything from the repo root.

```sh
yarn                 # install
yarn db generate     # prisma db push + prisma generate (required before first build and after schema changes)
yarn build           # turbo build of all workspaces (packages build before dependents via ^build)
yarn dev             # all apps in parallel
yarn start           # build + start all apps (same as production)
yarn deploy          # prisma db push + start prebuilt apps without building (Docker entrypoint)
yarn lint            # only apps/web defines lint (next lint)
yarn format          # prettier
yarn workspace <name> build   # e.g. @avatar-history/discord, web
```

There is no test suite. Verify changes with `yarn build` (tsc for packages, `next build` for web).

Config comes from a single root `.env` (see `.env.sample`). Packages load it via `dotenv` with path `../../.env`, so processes must run with the workspace directory as cwd, which turbo/yarn workspace scripts do.

## Architecture

```
apps/server   cron entrypoint: starts Discord bot, runs update() every 30s
apps/cdn      express static server for ../../static on CDN_PORT
apps/web      Next.js (pages router) + next-auth (Discord OAuth)
packages/discord  bot client, slash commands, update/scrape logic
packages/db       Prisma client + small entity helpers (getAvatars, createAvatar, ...)
packages/env      env constants (reads root .env)
packages/logging  tslog logger
packages/tsconfig shared base tsconfig
```

Internal packages are consumed via their compiled `dist/` output (`main: dist/index.js`), so a package must be built before changes in it are visible to apps.

**Update loop** (`packages/discord/src/core/updater.ts`): pages through guild members over REST (1000 per page, `after` cursor), sets bot presence, then `updateAvatars` and `updateUsernames` diff the members against the DB and record new entries. New avatars are downloaded from Discord's CDN to `static/avatars/<userId>/<avatarId>.png` (relative path `../../static`, shared with apps/cdn). Avatar rows use the Discord avatar hash as their primary key.

**Welcome message** (`packages/discord/src/core/welcome.ts`): on `GuildMemberAdd` in `GUILD_ID` the bot posts a components v2 welcome to `WELCOME_CHANNEL_ID` (fallback: the guild's system channel). Needs the `Guilds` + privileged `GuildMembers` gateway intents.

**Bot commands** (`packages/discord/src/command/`): each command is a `SlashCommand` or `UserCommand` object in `impl/`, registered in `commandHandler.ts#initCommands`. On startup all application commands are overwritten globally via REST. Every command is registered for guild and user installs and for guild/DM/group DM contexts (`applicationCommand.ts#availability`), so people can add the app to their account and use it anywhere. Responses are public on purpose (they advertise the app) and end with `utils/links.ts#promoFooter`; users without history get `utils/notTracked.ts`, an invite to the server. Public avatar URLs are built with `utils/cdn.ts` (`https://${CDN_URL}/avatars/...`, so `CDN_URL` is a bare host).

**Web**: next-auth with the Prisma adapter stores `User`/`Account`/`Session` in the same SQLite DB. API routes (`pages/api/*`) map the session to the Discord user id via `utils/id.ts#getDiscordId` (the `Account.providerAccountId`) and filter avatars/usernames by it. `/api/guilds` calls the Discord API with the stored OAuth access token (`guilds` scope). `next.config.js` exposes `GUILD_ID`, `GUILD_INVITE` and `GOOGLE_VERIFICATION_ID` to the client and whitelists `cdn.duckul.us` for `next/image`.

**Wrapped** (`/wrapped`, linked from the navbar and a banner on the home page): year in review computed in the browser (`utils/wrapped.ts`) from `/api/avatars` + `/api/usernames`; only the percentile comes from the server (`/api/wrapped/rank`). Owners can opt in to a public link `/w/<id>` (`WrappedShare` table, random id, unique per user and year, deleting the row revokes it). The share page only receives the computed stats of that year (`utils/sharedWrapped.ts`), skips the default meta tags in `_document` (`OWN_META_PAGES`) and uses a per-share link preview rendered with `next/og` (`utils/wrappedOg.tsx`, `/api/wrapped/og/[id].png`), which reads fonts from `node_modules/@fontsource` and avatars from `static/`. The downloadable share card is drawn on a canvas (`utils/wrappedCard.ts`) and loads avatars via `/api/avatars/file/[id]` (same origin, the CDN has no CORS headers, which would taint the canvas).

**Legal pages** (`/privacy`, `/terms`, linked from the footer): operator details come from `LEGAL_NAME`/`LEGAL_ADDRESS`/`LEGAL_EMAIL`/`LEGAL_HOSTING` at request time, so personal data stays out of the repo. Keep the privacy policy in sync when changing what data is collected, who can see it, or adding third parties (fonts are self-hosted via `@fontsource` for that reason).

**Admin panel** (`/admin`): roles are `superadmin` (hardcoded `SUPER_ADMIN_ID` in `packages/db/src/entities/admin.ts`), `admin` (rows in the `Admin` table, granted/revoked only by the super admin) and `user`. The next-auth `session` callback adds `discordId` and `role` to the session, so the role is re-evaluated on every request. Admin API routes under `pages/api/admin/` guard themselves with `utils/admin.ts#requireRole`; the client-side `AdminGate` is cosmetic only.

**Soft delete**: `Avatar.deletedAt`/`deletedBy`. `getAvatars()` hides deleted avatars by default (website + bot); the updater must call `getAvatars(true)`, otherwise it would try to re-insert a hidden avatar and hit the primary key.

**Database**: `packages/db/prisma/schema.prisma`, SQLite at `packages/db/prisma/dev.db`. Schema changes are applied with `prisma db push` (no migrations).

## Deployment

The `Dockerfile` is a multi-stage build on `node:26-slim`: a build stage compiles everything, the runtime stage only has production dependencies plus the build output, and the container only runs `yarn deploy`. Dependency layers depend only on package manifests, `yarn.lock` and the prisma schema, and CI uses the GitHub Actions build cache, so normal updates only ship a few MB. Keep it that way: pulling/unpacking multi-GB layers has frozen the production server. `turbo` is a runtime dependency because `yarn deploy` uses it. Runtime config comes from `.env` at container start, so nothing environment-specific may be baked in at build time: the home page uses `getServerSideProps` for `GUILD_ID`/`GUILD_INVITE` (which also makes `_document` read `GOOGLE_VERIFICATION_ID`/`WEB_URL` per request). Don't add values to `next.config.js` `env`. `docker-compose.yml` mounts `./static` and the SQLite file and exposes ports 7777 (CDN) and 3000 (web). Every push to `master` builds and pushes a multi-arch image to Docker Hub (`.github/workflows/docker-deploy.yml`).
