import localFont from 'next/font/local';

/**
 * Self-hosted fonts.
 *
 * The .woff2 files are vendored from the `@fontsource*` packages (see
 * `scripts/sync-fonts.mjs`). Self-hosting rather than `next/font/google`
 * means: no third-party request at runtime, builds work in CI without
 * outbound network, and no Google Fonts privacy caveat for EU visitors.
 *
 * To refresh: `npm run fonts:sync`.
 */

export const inter = localFont({
  src: [{ path: './fonts/inter-variable.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});

export const spaceGrotesk = localFont({
  src: [
    { path: './fonts/space-grotesk-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/space-grotesk-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/space-grotesk-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/space-grotesk-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});
