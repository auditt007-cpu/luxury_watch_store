/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    outputFileTracingIncludes: {
      "/": ["./data/**/*", "./prisma/**/*"],
      "/product/[id]": ["./data/**/*", "./prisma/**/*"],
    },
  },
};

export default nextConfig;
