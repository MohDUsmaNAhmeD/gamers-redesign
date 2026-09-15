import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Trim transparent padding to content bounds + small margin.
// User-provided removebg files are written into nobg/ under clean names;
// generated nobg files are trimmed in place.

const USER_MAP = {
  'consoles-removebg-preview.png': 'nobg/consoles.png',
  'controllers-removebg-preview.png': 'nobg/controllers.png',
  'headsets-removebg-preview.png': 'nobg/headsets.png',
  'keyboards-removebg-preview.png': 'nobg/keyboards.png',
  'mice-detail-removebg-preview.png': 'nobg/mice-detail.png',
  'monitors-removebg-preview.png': 'nobg/monitors.png',
  'games-removebg-preview.png': 'nobg/games.png',
  'accessories-removebg-preview.png': 'nobg/accessories.png',
};

const IN_PLACE = ['nobg/hero-controller.png', 'nobg/reference-console.png'];

const MARGIN = 8;

async function trimImage(srcPath, outPath) {
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * channels;
    for (let x = 0; x < w; x++) {
      if (data[row + x * channels + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error('fully transparent');
  minX = Math.max(0, minX - MARGIN);
  minY = Math.max(0, minY - MARGIN);
  maxX = Math.min(w - 1, maxX + MARGIN);
  maxY = Math.min(h - 1, maxY + MARGIN);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  await sharp(srcPath)
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .png()
    .toFile(outPath);
  return { w: cw, h: ch, ratio: (cw / ch).toFixed(2) };
}

async function main() {
  await mkdir('public/images/nobg', { recursive: true });
  const results = [];
  for (const [src, out] of Object.entries(USER_MAP)) {
    results.push([src, await trimImage(join('public/images', src), join('public/images', out))]);
  }
  for (const p of IN_PLACE) {
    const full = join('public/images', p);
    const tmp = full + '.tmp.png';
    const r = await trimImage(full, tmp);
    const { rename } = await import('fs/promises');
    await rename(tmp, full);
    results.push([p, r]);
  }
  for (const [name, r] of results) console.log(name.padEnd(38), `${r.w}x${r.h}`, 'ratio=' + r.ratio);
}

main();
