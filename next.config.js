/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/explore/*': ['./data/explore/catalog/**/*'],
  },

  // Dev-only: the server binds 0.0.0.0, so localhost / 127.0.0.1 / the LAN IP
  // are distinct origins to Next's cross-origin check for /_next/* assets.
  allowedDevOrigins: ['localhost', '127.0.0.1'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer, dev }) => {
    // Next forbids changing devtool in dev; filesystem pack cache then
    // serializes eval-source-map strings (~192kiB). Memory cache skips that.
    if (dev) config.cache = { type: 'memory' }

    if (isServer) {
      const prismaExternal = ({ request }, callback) => {
        if (request === '@prisma/client' || request?.startsWith('.prisma/')) {
          return callback(null, `commonjs ${request}`)
        }
        callback()
      }
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, prismaExternal]
        : [config.externals, prismaExternal].filter(Boolean)
    }

    return config
  },
}

export default nextConfig
