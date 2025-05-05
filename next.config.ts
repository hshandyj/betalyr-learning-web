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
  experimental: {
    // 暂时禁用缺少Suspense边界的警告
    missingSuspenseWithCSRBailout: false,
  },
} as NextConfig;

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
