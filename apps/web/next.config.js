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
};

module.exports = nextConfig;
