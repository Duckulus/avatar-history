/** @type {import('next').NextConfig} */
require("dotenv").config({
  path: "../../.env",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{protocol: "https", hostname: "cdn.duckul.us"}],
  },
};

module.exports = nextConfig;
