import { useEffect } from 'react';
import { createSectionReveals } from '../animations/sectionReveal';
import { setupProductTransferScroll } from '../animations/productTransfer';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ScrollAnimations() {
  useEffect(() => {
    if (reduced) return;

    let cleanupFns: (() => void)[] = [];

    const timer = setTimeout(() => {
      const main = document.querySelector('main');
      if (!main) return;

      const sectionCtx = createSectionReveals(main);
      if (sectionCtx) cleanupFns.push(() => sectionCtx.revert());

      // Set up the controller-to-product transfer
      const hero = document.querySelector<HTMLElement>('.hero-cinematic');
      const flightProxy = document.querySelector<HTMLElement>('.global-flight-layer');

      if (hero && flightProxy) {
        const transferCtx = setupProductTransferScroll(hero, flightProxy);
        if (transferCtx) cleanupFns.push(() => transferCtx.revert());
      }

      // Refresh after images load
      const onLoaded = () => {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      };
      window.addEventListener('load', onLoaded, { once: true });
      cleanupFns.push(() => window.removeEventListener('load', onLoaded));
    }, 200);

    return () => {
      clearTimeout(timer);
      cleanupFns.forEach(fn => fn());
    };
  }, []);

  return null;
}
