// Generates public/og-image.png from scripts/og-image.svg.
// Run with `npm run og` or `node scripts/build-og.mjs`.

import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcSvg = resolve(__dirname, 'og-image.svg');
const outPng = resolve(__dirname, '..', 'public', 'og-image.png');

const svgBuffer = await readFile(srcSvg);

await mkdir(dirname(outPng), { recursive: true });

await sharp(svgBuffer, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(outPng);

console.log(`✓ og-image.png written to ${outPng}`);
