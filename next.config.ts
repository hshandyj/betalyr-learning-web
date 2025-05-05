import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  eslint: {
    // 在生产构建期间忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  // 忽略TypeScript和构建错误
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // 跳过构建期间的类型检查
    skipTypechecking: true,
  },
} as NextConfig;

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
