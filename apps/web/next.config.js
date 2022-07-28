/** @type {import('next').NextConfig} */
require("dotenv").config({
  path: "../../.env",
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.duckul.us"],
  },
  env: {
    GUILD_ID: process.env.GUILD_ID,
    GUILD_INVITE: process.env.GUILD_INVITE,
  },
};

module.exports = nextConfig;
