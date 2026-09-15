import { removeBackground } from '@imgly/background-removal';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';

const SRC = 'public/images';
const OUT = 'public/images/nobg';

const TARGETS = [
  'consoles.webp',
  'controllers.webp',
  'headsets.webp',
  'keyboards.webp',
  'mice.webp',
  'monitors.webp',
  'games.webp',
  'accessories.webp',
  'consoles-detail.webp',
  'controllers-detail.webp',
  'headsets-detail.webp',
  'keyboards-detail.webp',
  'mice-detail.webp',
  'monitors-detail.webp',
  'games-detail.webp',
  'accessories-detail.webp',
  'hero-controller.webp',
  'reference-console.webp',
];

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log(`Processing ${TARGETS.length} images...`);

  for (const file of TARGETS) {
    const srcPath = join(SRC, file);
    const outName = file.replace(extname(file), '.png');
    const outPath = join(OUT, outName);

    console.log(`  ${file} → ${outName}`);
    try {
      const buffer = await removeBackground(srcPath, {
        model: 'isnet_fp16',
        output: { format: 'image/png', quality: 1 },
      });
      await writeFile(outPath, buffer);
      console.log(`    done`);
    } catch (err) {
      console.error(`    failed: ${err.message}`);
    }
  }
  console.log('All done!');
}

main();
