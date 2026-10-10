import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
    Static export, for GitHub Pages.

    The site has no server-side data dependencies — no Route Handlers, no
    middleware, no server actions — and `/work/[slug]` already ships
    `generateStaticParams` with `dynamicParams = false`, so every page it can
    serve is known at build time. Drop `output` again the moment any of that
    stops being true.
  */
  output: 'export',

  /*
    Pages serves a project repo from a sub-path, `/velocity-labs`, so the build
    has to know its own prefix. Empty locally, set by the workflow in CI, which
    keeps `npm run dev` on `/` where it has always been.

    `trailingSlash` because Pages has no rewrite layer: without it `/work/yuzu`
    is a 404 and only `/work/yuzu.html` resolves.
  */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,

  images: {
    // All imagery ships from /public. Add remote hosts here if that changes.
    remotePatterns: [],
  },

  eslint: {
    dirs: ['src', 'scripts'],
  },

  /*
    IGNORED UNDER `output: 'export'`, and Next warns about it on every build.
    A static export is a folder of files; there is no server to attach headers
    to, so on GitHub Pages the caching below is whatever Pages decides. It is
    kept because it is correct wherever this is served by a real server —
    Vercel, a Node host, a CDN with a config of its own.
  */
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
