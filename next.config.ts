import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 静的画像の最適化を無効化
  },
};

export default nextConfig;
