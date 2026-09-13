import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;

    const ctx = gsap.context(() => {
      const el = ref.current;
      if (!el) return;

      // Eyebrow slide in
      const eyebrows = el.querySelectorAll('.eyebrow');
      if (eyebrows.length) {
        gsap.fromTo(eyebrows,
          { opacity: 0, x: -24 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' }
          }
        );
      }

      // Headings rise up
      const headings = el.querySelectorAll('h2');
      if (headings.length) {
        gsap.fromTo(headings,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }

      // Paragraphs and text
      const texts = el.querySelectorAll('p, .text-link');
      if (texts.length) {
        gsap.fromTo(texts,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none none' }
          }
        );
      }

      // Cards and grid items
      const cards = el.querySelectorAll('.category-card, .product-card, .trust-item');
      if (cards.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' }
          }
        );
      }

      // Buttons
      const buttons = el.querySelectorAll('.button');
      if (buttons.length) {
        gsap.fromTo(buttons,
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06,
            scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none none' }
          }
        );
      }

      // Campaign section special treatment
      const campaign = el.querySelector('.campaign');
      if (campaign) {
        gsap.fromTo(campaign,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: campaign, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Showcase section
      const showcaseVisual = el.querySelector('.showcase-visual');
      const showcaseContent = el.querySelector('.showcase-content');
      if (showcaseVisual && showcaseContent) {
        gsap.fromTo(showcaseVisual,
          { opacity: 0, x: -60, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: showcaseVisual, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
        gsap.fromTo(showcaseContent,
          { opacity: 0, x: 60 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.15,
            scrollTrigger: { trigger: showcaseContent, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }

      // Stats counter animation
      const stats = el.querySelectorAll('.showcase-stat strong');
      stats.forEach(stat => {
        const text = stat.textContent || '';
        const num = parseFloat(text);
        if (!isNaN(num)) {
          const suffix = text.replace(/[\d.]/g, '');
          const counter = { val: 0 };
          gsap.to(counter, {
            val: num, duration: 1.5, ease: 'power2.out',
            scrollTrigger: { trigger: stat, start: 'top 85%', toggleActions: 'play none none none' },
            onUpdate: () => {
              stat.textContent = (num >= 1 ? Math.round(counter.val) : counter.val.toFixed(1)) + suffix;
            }
          });
        }
      });

      // CTA banner
      const cta = el.querySelector('.cta-banner');
      if (cta) {
        gsap.fromTo(cta,
          { opacity: 0, y: 50, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: cta, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;

    const el = ref.current;
    const images = el.querySelectorAll('.category-image img, .product-image-link img, .showcase-visual img');

    images.forEach(img => {
      gsap.fromTo(img,
        { y: -20 },
        {
          y: 20, ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return ref;
}
