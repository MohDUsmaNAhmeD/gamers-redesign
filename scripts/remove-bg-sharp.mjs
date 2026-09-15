import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';

const SRC = 'public/images';
const OUT = 'public/images/nobg';

const TARGETS = [
  'consoles.webp', 'controllers.webp', 'headsets.webp', 'keyboards.webp',
  'mice.webp', 'monitors.webp', 'games.webp', 'accessories.webp',
  'consoles-detail.webp', 'controllers-detail.webp', 'headsets-detail.webp',
  'keyboards-detail.webp', 'mice-detail.webp', 'monitors-detail.webp',
  'games-detail.webp', 'accessories-detail.webp',
  'hero-controller.webp', 'reference-console.webp',
];

const GLOBAL_TOL = 38;
const LOCAL_TOL = 10;

function dist2(a, b) { return (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2; }

function floodRemove(rgba, w, h) {
  const color = (p) => [rgba[p*4], rgba[p*4+1], rgba[p*4+2]];
  const border = [];
  for (let x = 0; x < w; x++) border.push(x, (h-1)*w + x);
  for (let y = 0; y < h; y++) border.push(y*w, y*w + w - 1);

  const samples = border.map(color);
  const ref = [0, 1, 2].map((c) => samples.map((s) => s[c]).sort((a, b) => a - b)[Math.floor(samples.length / 2)]);

  const masked = new Uint8Array(w * h);
  const queue = [];
  for (const p of border) {
    if (dist2(color(p), ref) < GLOBAL_TOL * GLOBAL_TOL) { masked[p] = 1; queue.push(p); }
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const cp = color(p);
    const x = p % w, y = (p / w) | 0;
    const neighbors = [];
    if (x > 0) neighbors.push(p - 1);
    if (x < w - 1) neighbors.push(p + 1);
    if (y > 0) neighbors.push(p - w);
    if (y < h - 1) neighbors.push(p + w);
    for (const q of neighbors) {
      if (masked[q]) continue;
      const cq = color(q);
      if (dist2(cq, ref) < GLOBAL_TOL * GLOBAL_TOL || dist2(cq, cp) < LOCAL_TOL * LOCAL_TOL) {
        masked[q] = 1;
        queue.push(q);
      }
    }
  }

  for (let p = 0; p < w * h; p++) if (masked[p]) rgba[p*4 + 3] = 0;
  return rgba;
}

async function processFile(file) {
  const { data, info } = await sharp(join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = new Uint8Array(data.buffer, data.byteOffset, data.length);
  floodRemove(rgba, info.width, info.height);
  return sharp(Buffer.from(rgba), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Processing ${TARGETS.length} images...`);
  for (const file of TARGETS) {
    const outName = file.replace(extname(file), '.png');
    try {
      const buf = await processFile(file);
      await writeFile(join(OUT, outName), buf);
      console.log(`  ${file} -> ${outName} OK`);
    } catch (err) {
      console.error(`  ${file} failed: ${err.message}`);
    }
  }
  console.log('All done!');
}

main();
