import { removeBackground } from '@imgly/background-removal';

let cachedBlobs: Map<string, Blob> = new Map();

export async function removeImageBackground(src: string): Promise<string> {
  if (cachedBlobs.has(src)) {
    return URL.createObjectURL(cachedBlobs.get(src)!);
  }

  const blob = await removeBackground(src, {
    model: 'isnet_fp16',
    output: { format: 'image/png' },
  });

  cachedBlobs.set(src, blob);
  return URL.createObjectURL(blob);
}
