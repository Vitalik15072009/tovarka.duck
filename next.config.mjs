/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        // Telegram Mini Apps must be embeddable in an iframe inside Telegram
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://web.telegram.org https://k.web.telegram.org https://a.web.telegram.org;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
