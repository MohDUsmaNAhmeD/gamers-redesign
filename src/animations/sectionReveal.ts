import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createSectionReveals(container: HTMLElement) {
  if (reduced) return null;

  const ctx = gsap.context(() => {

    // ── Marquee / Tech Rail ──
    const marquee = container.querySelector<HTMLElement>('.tech-rail');
    if (marquee) {
      gsap.from(marquee, {
        opacity: 0, y: -10,
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: marquee, start: 'top 98%', toggleActions: 'play none none none' }
      });
    }

    // ── Categories: Asymmetric reveal with clip-path ──
    const catSection = container.querySelector<HTMLElement>('.categories-editorial');
    if (catSection) {
      const catCards = gsap.utils.toArray<HTMLElement>('.editorial-cat-card');
      catCards.forEach((card, i) => {
        const img = card.querySelector<HTMLElement>('.cat-img-wrap');
        const label = card.querySelector<HTMLElement>('.cat-label');
        
        gsap.fromTo(card,
          { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
            duration: 0.8, ease: 'power3.out',
            delay: i * 0.06,
            scrollTrigger: { trigger: catSection, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
        
        if (img) {
          gsap.fromTo(img,
            { scale: 1.2, y: 30 },
            {
              scale: 1, y: 0,
              duration: 1, ease: 'power2.out',
              delay: i * 0.06,
              scrollTrigger: { trigger: catSection, start: 'top 80%', toggleActions: 'play none none none' }
            }
          );
        }
        
        if (label) {
          gsap.fromTo(label,
            { y: 20, opacity: 0 },
            {
              y: 0, opacity: 1,
              duration: 0.6, ease: 'power2.out',
              delay: 0.2 + i * 0.06,
              scrollTrigger: { trigger: catSection, start: 'top 80%', toggleActions: 'play none none none' }
            }
          );
        }
      });
    }

    // ── Featured Products: Editorial stagger ──
    const prodSection = container.querySelector<HTMLElement>('.featured-editorial');
    if (prodSection) {
      const prodCards = gsap.utils.toArray<HTMLElement>('.product-card');
      prodCards.forEach((card, i) => {
        const img = card.querySelector<HTMLElement>('.product-image-link img');
        const badge = card.querySelector<HTMLElement>('.product-badge');
        const info = card.querySelector<HTMLElement>('.product-info');
        
        gsap.fromTo(card,
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.7, ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: { trigger: prodSection, start: 'top 82%', toggleActions: 'play none none none' }
          }
        );
        
        if (img) {
          gsap.fromTo(img,
            { scale: 1.15, y: 20 },
            {
              scale: 1, y: 0,
              duration: 0.9, ease: 'power2.out',
              delay: 0.1 + i * 0.08,
              scrollTrigger: { trigger: prodSection, start: 'top 82%', toggleActions: 'play none none none' }
            }
          );
        }
        
        if (badge) {
          gsap.fromTo(badge,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1, opacity: 1,
              duration: 0.4, ease: 'back.out(2)',
              delay: 0.3 + i * 0.08,
              scrollTrigger: { trigger: prodSection, start: 'top 82%', toggleActions: 'play none none none' }
            }
          );
        }
        
        if (info) {
          gsap.fromTo(info,
            { y: 12, opacity: 0 },
            {
              y: 0, opacity: 1,
              duration: 0.5, ease: 'power2.out',
              delay: 0.2 + i * 0.08,
              scrollTrigger: { trigger: prodSection, start: 'top 82%', toggleActions: 'play none none none' }
            }
          );
        }
      });
    }

    // ── Campaign: Parallax depth ──
    const campaign = container.querySelector<HTMLElement>('.campaign-editorial');
    if (campaign) {
      const campImg = campaign.querySelector<HTMLElement>('.camp-img');
      const campText = campaign.querySelector<HTMLElement>('.camp-text');
      const campPrice = campaign.querySelector<HTMLElement>('.camp-price');
      
      gsap.fromTo(campaign,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: campaign, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
      
      if (campImg) {
        gsap.fromTo(campImg,
          { x: 60, opacity: 0, scale: 0.95 },
          {
            x: 0, opacity: 1, scale: 1,
            duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: campaign, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
        // Parallax on scroll
        gsap.to(campImg, {
          y: -30, ease: 'none',
          scrollTrigger: { trigger: campaign, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      }
      
      if (campText) {
        gsap.fromTo(campText,
          { x: -40, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1,
            scrollTrigger: { trigger: campaign, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }
      
      if (campPrice) {
        gsap.fromTo(campPrice,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.2,
            scrollTrigger: { trigger: campaign, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }
    }

    // ── Showcase: Pinned scroll story ──
    const showcase = container.querySelector<HTMLElement>('.showcase-story');
    if (showcase) {
      const stages = gsap.utils.toArray<HTMLElement>('.showcase-stage');
      const specs = gsap.utils.toArray<HTMLElement>('.spec-reveal');
      
      if (stages.length) {
        gsap.fromTo(stages[0],
          { opacity: 0, scale: 0.9, y: 40 },
          {
            opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: showcase, start: 'top 75%', toggleActions: 'play none none none' }
          }
        );
      }
      
      specs.forEach((spec, i) => {
        gsap.fromTo(spec,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out',
            delay: 0.15 + i * 0.12,
            scrollTrigger: { trigger: showcase, start: 'top 70%', toggleActions: 'play none none none' }
          }
        );
      });
    }

    // ── Trust: Horizontal reveal ──
    const trust = container.querySelector<HTMLElement>('.trust-editorial');
    if (trust) {
      const statement = trust.querySelector<HTMLElement>('.trust-statement');
      const items = gsap.utils.toArray<HTMLElement>('.trust-vert-item');
      
      if (statement) {
        gsap.fromTo(statement,
          { x: -40, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: trust, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }
      
      items.forEach((item, i) => {
        gsap.fromTo(item,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
            delay: 0.1 + i * 0.1,
            scrollTrigger: { trigger: trust, start: 'top 75%', toggleActions: 'play none none none' }
          }
        );
      });
    }

    // ── CTA Finale: Large-scale typography movement ──
    const cta = container.querySelector<HTMLElement>('.cta-finale');
    if (cta) {
      const lines = gsap.utils.toArray<HTMLElement>('.cta-line');
      const btn = cta.querySelector<HTMLElement>('.cta-btn');
      
      lines.forEach((line, i) => {
        gsap.fromTo(line,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.7, ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      });
      
      if (btn) {
        gsap.fromTo(btn,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.35,
            scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }
    }

  }, container);

  return ctx;
}
