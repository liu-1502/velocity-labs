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

/*
 * `optional`, not `swap`, and the reason is a reflow you can see.
 *
 * Next builds a metric-matched fallback for each face, but it matches the
 * VERTICAL metrics — ascent, descent, line-gap — so the line box does not jump.
 * It does not match the horizontal ones. The generated fallback is Arial at
 * `size-adjust: 110.87%` for Space Grotesk, which is almost 11% wider per line.
 *
 * The philosophy headline is authored as two hard lines and sized to fill the
 * gutter box, and 11% is more than its margin at the tight end of the ladder:
 * at 861-900px the longest line needs 577px of an about-620px box in the real
 * face and about 640px in the fallback. So `swap` rendered it wrapped to four
 * lines, with "We" and "has" alone, and then re-flowed to two when the webfont
 * arrived. Invisible on localhost, where the font is there in the same tick;
 * plainly visible on a deployed site over a network.
 *
 * `optional` gives the browser a ~100ms window: if the font is not ready it
 * keeps the fallback for that page view and never swaps, so the text is laid
 * out once. These are self-hosted, preloaded and small, so after the first
 * visit they are always ready — and on the first visit a stable page in the
 * fallback beats a page that rearranges itself under the reader.
 */
export const inter = localFont({
  src: [{ path: './fonts/inter-variable.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'optional',
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
  display: 'optional',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});
