import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

interface FlightTarget {
  el: HTMLElement;
  centerX: number;
  centerY: number;
}

function findClosestProductCard(sourceX: number, sourceY: number): FlightTarget | null {
  const cards = [...document.querySelectorAll<HTMLElement>('.product-card')];
  let closest: FlightTarget | null = null;
  let minDist = Infinity;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    // Ignore cards not visible
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
    if (rect.right < 0 || rect.left > window.innerWidth) continue;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - sourceX;
    const dy = cy - sourceY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closest = { el: card, centerX: cx, centerY: cy };
    }
  }

  return closest;
}

export function setupProductTransferScroll(
  heroRef: HTMLElement,
  flightProxy: HTMLElement
) {
  if (reduced) return null;

  const ctx = gsap.context(() => {
    let triggered = false;

    ScrollTrigger.create({
      trigger: '.featured-editorial',
      start: 'top 95%',
      end: 'top 60%',
      onEnter: () => {
        if (triggered) return;
        triggered = true;

        const proxyImg = flightProxy.querySelector<HTMLImageElement>('.flight-controller-img');
        if (!proxyImg) return;

        // Source: the hero controller's last known position (use viewport center-top area)
        const sourceX = window.innerWidth / 2;
        const sourceY = window.innerHeight * 0.3;

        const target = findClosestProductCard(sourceX, sourceY);
        if (!target) return;

        // Set up proxy
        proxyImg.src = '/images/nobg/hero-controller.png';
        gsap.set(flightProxy, { display: 'block', opacity: 1, position: 'fixed', zIndex: 9999, pointerEvents: 'none' });
        gsap.set(proxyImg, {
          width: 100,
          height: 100,
          x: sourceX - 50,
          y: sourceY - 50,
          scale: 1,
          rotation: 0,
          opacity: 1,
          objectFit: 'contain',
        });

        // Hide target card image briefly
        const targetImg = target.el.querySelector<HTMLElement>('.product-image-link');

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(flightProxy, { display: 'none' });
          }
        });

        // Fly to target
        tl.to(proxyImg, {
          x: target.centerX - 50,
          y: target.centerY - 50,
          scale: 0.3,
          rotation: 720,
          duration: 0.4,
          ease: 'power3.in',
        })
        .to(proxyImg, {
          opacity: 0,
          duration: 0.08,
          ease: 'power2.in',
        }, '-=0.08');

        // Target card reaction
        gsap.fromTo(target.el,
          { boxShadow: '0 0 0 0 rgba(181,245,56,0)' },
          {
            boxShadow: '0 0 40px 6px rgba(181,245,56,0.25)',
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
          }
        );

        // Brief image scale punch on target
        if (targetImg) {
          gsap.fromTo(targetImg,
            { scale: 1 },
            {
              scale: 1.05,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: 'power2.out',
            }
          );
        }
      },
    });
  }, heroRef);

  return ctx;
}
