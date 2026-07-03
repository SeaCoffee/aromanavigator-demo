// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // не валить prod-билд из-за ESLint
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    serverActions: { bodySizeLimit: '64mb' },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
        ],
      },
    ];
  },
};

export default nextConfig;
