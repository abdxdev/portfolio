import { createMDX } from 'fumadocs-mdx/next';

// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'opengraph.githubassets.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '**',
      },
    ],
  },
};

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});


export default withMDX(nextConfig);