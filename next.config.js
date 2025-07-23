/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // 移除静态导出配置以支持API路由
  // output: 'export',
  // trailingSlash: true,
  // distDir: 'dist',
};

module.exports = nextConfig;
