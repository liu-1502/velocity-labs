#!/usr/bin/env node
/**
 * Generates the video poster frames.
 *
 *   npm run posters:make
 *
 * Poster frames do NOT exist on the original site — there is nothing to
 * download, they have to be rendered from the videos. Run `assets:fetch`
 * first so the .mp4 files are present.
 *
 * Timestamps and output sizes below were chosen against the real videos
 * (dimensions and durations verified from the deployed site), avoiding the
 * black lead-in frame each clip starts on.
 *
 * ffmpeg comes from the `ffmpeg-static` devDependency, so this works on a
 * fresh clone with no system install. A system ffmpeg on PATH is used as a
 * fallback if the package is absent.
 */

import { execFile } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIDEO_DIR = join(ROOT, 'public/assets/video');

/**
 * source          — file in public/assets/video
 * poster          — output filename
 * seconds         — timestamp to grab
 * width           — output width; height follows the source aspect ratio
 * quality         — ffmpeg -q:v, 2 (best) … 31 (worst)
 */
const POSTERS = [
  {
    source: 'hero-loop-audio.mp4',
    poster: 'hero-loop-poster.jpg',
    seconds: 1.5,
    width: 1280,
    quality: 4,
    note: 'source 1920×824, 6.5s',
  },
  {
    source: 'philosophy.mp4',
    poster: 'philosophy-poster.jpg',
    seconds: 1.5,
    width: 1280,
    quality: 5,
    note: 'source 1280×712, 28s (re-encoded — see ASSETS.md)',
  },
  {
    source: 'contact-bg.mp4',
    poster: 'contact-bg-poster.jpg',
    seconds: 1.5,
    width: 1280,
    quality: 5,
    note: 'source 1280×720, 10s',
  },
];

/** Bundled binary if installed, otherwise whatever is on PATH. */
async function findFfmpeg() {
  const candidates = [];

  try {
    const { default: bundled } = await import('ffmpeg-static');
    if (bundled) candidates.push(bundled);
  } catch {
    // ffmpeg-static not installed — fall through to PATH.
  }

  candidates.push('ffmpeg');

  for (const bin of candidates) {
    try {
      await run(bin, ['-version']);
      return bin;
    } catch {
      continue;
    }
  }

  return null;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ffmpeg = await findFfmpeg();

  if (!ffmpeg) {
    console.error(
      '\nNo usable ffmpeg found.\n' +
        '  Run `npm install` to get the bundled ffmpeg-static binary,\n' +
        '  or install ffmpeg yourself (macOS: brew install ffmpeg).\n',
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(VIDEO_DIR, { recursive: true });

  let made = 0;
  const missing = [];

  for (const spec of POSTERS) {
    const input = join(VIDEO_DIR, spec.source);
    const output = join(VIDEO_DIR, spec.poster);

    if (!(await exists(input))) {
      missing.push(spec.source);
      continue;
    }

    await run(ffmpeg, [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      String(spec.seconds),
      '-i',
      input,
      '-frames:v',
      '1',
      '-vf',
      `scale=${spec.width}:-2`,
      '-q:v',
      String(spec.quality),
      output,
    ]);

    console.log(`  ok     ${spec.poster}  (${spec.note})`);
    made += 1;
  }

  if (missing.length) {
    console.error(
      `\nSkipped ${missing.length} — video not found: ${missing.join(', ')}\n` +
        'Run `npm run assets:fetch` first.\n',
    );
    process.exitCode = 1;
  }

  if (made) console.log(`\n${made} poster(s) written to public/assets/video.\n`);
}

await main();
