import { useEffect, useState } from 'react';
import { removeImageBackground } from '../lib/removeBg';

export default function BgRemovedImage({ src, alt, className, ...props }: { src: string; alt: string; className?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    removeImageBackground(src).then((blobUrl) => {
      if (!revoked) setUrl(blobUrl);
    });
    return () => { revoked = true; };
  }, [src]);

  return <img src={url || src} alt={alt} className={className} {...props} />;
}
