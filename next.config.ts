import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // <--- OBRIGATÓRIO PARA DOCKER
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};

export default nextConfig;