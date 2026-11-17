/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    const gatewayUrl = process.env.API_GATEWAY_URL || "http://localhost:8080";
    return [
      {
        source: "/api/media/:path*",
        destination: `${gatewayUrl}/api/v1/media/:path*`,
      },
      {
        source: "/api/catalog/:path*",
        destination: `${gatewayUrl}/api/v1/catalog/:path*`,
      },
      {
        source: "/api/search/:path*",
        destination: `${gatewayUrl}/api/v1/search/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${gatewayUrl}/api/v1/users/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${gatewayUrl}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
