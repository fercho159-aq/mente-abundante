import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === 'true';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Solo para build móvil - exportación estática
  ...(isMobileBuild && {
    output: 'export',
  }),
};

export default nextConfig;
