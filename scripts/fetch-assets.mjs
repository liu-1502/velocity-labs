#!/usr/bin/env node
/**
 * Pulls the original media from the deployed site into ./public/assets.
 *
 *   npm run assets:fetch
 *
 * The repo ships with lightweight placeholders so `npm run dev` works from a
 * clean clone. Run this once to replace them with the real files.
 *
 * Override the source with ASSET_SOURCE_ORIGIN (see .env.example).
 */

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

const ORIGIN = process.env.ASSET_SOURCE_ORIGIN ?? 'https://velocity-labs-revamp.vercel.app';

/** [ path on the source site, path inside ./public ] */
const ASSETS = [
  // --- video ---------------------------------------------------------
  ['/assets/hero-loop-audio.mp4', 'assets/video/hero-loop-audio.mp4'],
  ['/assets/philosophy2.mp4', 'assets/video/philosophy.mp4'],
  ['/assets/contact-bg.mp4', 'assets/video/contact-bg.mp4'],

  // --- Why Velocity backdrop -----------------------------------------
  ['/assets/vscode-bg.png', 'assets/why/vscode-bg.png'],

  // --- project brand marks -------------------------------------------
  ['/assets/brand/novaland.png', 'assets/brand/novaland.png'],
  ['/assets/brand/btse-blue.png', 'assets/brand/btse-blue.png'],
  ['/assets/brand/yuzu-icon.png', 'assets/brand/yuzu-icon.png'],

  // --- partner logos --------------------------------------------------
  ['/assets/partners/w-fordefi.png', 'assets/partners/w-fordefi.png'],
  ['/assets/partners/w-accountable.png', 'assets/partners/w-accountable.png'],
  ['/assets/partners/w-btse.png', 'assets/partners/w-btse.png'],
  ['/assets/partners/w-perennial.png', 'assets/partners/w-perennial.png'],
  ['/assets/partners/w-anboto.png', 'assets/partners/w-anboto.png'],
  ['/assets/partners/w-treehouse.png', 'assets/partners/w-treehouse.png'],
];

const FORCE = process.argv.includes('--force');

function human(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function exists(path) {
  try {
    const s = await stat(path);
    // Placeholders are tiny; treat anything under 2 KB as "not the real file".
    return s.size > 2048;
  } catch {
    return false;
  }
}

async function fetchOne(from, to) {
  const dest = join(PUBLIC, to);

  if (!FORCE && (await exists(dest))) {
    console.log(`  skip   ${to} (already present — use --force to re-download)`);
    return { skipped: true };
  }

  const url = `${ORIGIN}${from}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buffer);

  console.log(`  ok     ${to}  (${human(buffer.byteLength)})`);
  return { bytes: buffer.byteLength };
}

async function main() {
  console.log(`\nFetching assets from ${ORIGIN}\n`);

  let total = 0;
  let attempted = 0;
  const failures = [];
  const reasons = new Set();

  for (const [from, to] of ASSETS) {
    try {
      const result = await fetchOne(from, to);
      total += result.bytes ?? 0;
      if (!result.skipped) attempted += 1;
    } catch (error) {
      console.error(`  FAIL   ${to}  — ${error.message}`);
      failures.push(to);
      reasons.add(error.message);
      attempted += 1;
    }
  }

  console.log(`\nDownloaded ${human(total)}.`);

  if (!failures.length) {
    console.log('All assets present.\n');
    return;
  }

  console.error(`\n${failures.length} asset(s) failed.`);

  /*
    Every request failing with the same error almost always means the network
    is blocked (corporate proxy, CI sandbox, offline) rather than the assets
    being gone. Saying so saves the next person from checking 14 URLs by hand.
  */
  if (failures.length === attempted && reasons.size === 1) {
    const [reason] = [...reasons];
    console.error(
      `\nEvery request failed with the same error (${reason}), which usually means\n` +
        `outbound network access is blocked here rather than the files being missing.\n` +
        `Try again from a machine with normal internet access, or set\n` +
        `ASSET_SOURCE_ORIGIN to a reachable mirror.\n`,
    );
  } else {
    console.error(`\nDrop the missing files into ./public manually — see ASSETS.md.\n`);
  }

  process.exitCode = 1;
}

await main();
