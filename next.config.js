/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MAP_BOX_API_KEY: process.env.MAP_BOX_API_KEY,
  },
};

module.exports = nextConfig;
