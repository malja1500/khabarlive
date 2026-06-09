/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // اجازه لود عکس از هر دامنه‌ای
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
