import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static-export friendly: the site has no server-side data dependencies.
  // Remove `output` if you later add Route Handlers / server actions.
  // output: 'export',

  images: {
    // All imagery ships from /public. Add remote hosts here if that changes.
    remotePatterns: [],
  },

  eslint: {
    dirs: ['src', 'scripts'],
  },

  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            /*
              Revalidate, do NOT mark immutable.

              This was `max-age=31536000, immutable` — a year, and `immutable`
              tells the browser not even to ASK whether the file changed. That
              pair is only safe for content-addressed URLs, where new bytes mean
              a new filename. These are stable filenames: `novaland.webp` keeps
              its name when its contents are replaced, so every browser that had
              loaded the old screenshot kept showing it for up to a year while
              the server held the new one. Measured, after replacing three
              screenshots: the three reused filenames painted the OLD pixels,
              the three new filenames painted the new ones.

              `max-age=0, must-revalidate` costs one conditional request per
              asset per visit, which the ETag answers with a 304 and no body, so
              an unchanged 3.9MB video is still not re-downloaded — and a
              changed one reaches the reader on the next load instead of next
              year.

              If these ever need the long cache back, the way to earn it is to
              put a content hash in the filename, not to re-add `immutable`.
            */
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
