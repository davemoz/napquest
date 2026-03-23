/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MAP_BOX_API_KEY: process.env.MAP_BOX_API_KEY,
  },
  async redirects() {
    return [
      {
        source: "/ads.txt",
        destination: "/public/ads.txt",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
