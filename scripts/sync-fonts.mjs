#!/usr/bin/env node
/**
 * Vendors the .woff2 files we self-host from the @fontsource packages
 * into src/app/fonts/.
 *
 *   npm run fonts:sync
 *
 * Run this after bumping @fontsource-variable/inter or @fontsource/space-grotesk.
 * The copied files ARE committed — that is what keeps builds network-free.
 */

import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'src/app/fonts');
const MODULES = join(ROOT, 'node_modules');

const FONTS = [
  /*
    The `opsz` file, not the `wght` one. Production loads Inter from Google
    with both axes (`Inter:opsz,wght@14..32,100..900`), and browsers apply
    `font-optical-sizing: auto` by default — so at the 14.72px used in the
    leadership bullets the glyphs are narrower than the weight-only file's.
    With `wght` alone, one bullet wrapped to a second line that does not wrap
    on the real site, making the card 22.8px taller.
  */
  ['@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2', 'inter-variable.woff2'],
  /*
    400 is not optional: the original loads Space Grotesk 400/500/600/700, and
    every kicker, eyebrow, domain chip and marquee label sets the display face
    with no font-weight — so they all resolve to 400.
  */
  [
    '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2',
    'space-grotesk-400.woff2',
  ],
  [
    '@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2',
    'space-grotesk-500.woff2',
  ],
  [
    '@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2',
    'space-grotesk-600.woff2',
  ],
  [
    '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2',
    'space-grotesk-700.woff2',
  ],
];

await mkdir(DEST, { recursive: true });

for (const [from, to] of FONTS) {
  await copyFile(join(MODULES, from), join(DEST, to));
  console.log(`  ok  ${to}`);
}

console.log('\nFonts synced to src/app/fonts.\n');
