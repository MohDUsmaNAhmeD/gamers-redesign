import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

export interface ControllerAPI {
  getObject: () => THREE.Object3D | null;
}

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createHeroScrollExperience(
  heroRef: HTMLElement,
  controllerAPI: ControllerAPI | null,
) {
  if (reduced) return null;

  const headline = heroRef.querySelector<HTMLElement>('.hero-headline');
  const subline = heroRef.querySelector<HTMLElement>('.hero-subline');
  const cta = heroRef.querySelector<HTMLElement>('.hero-cta');
  const scrollHint = heroRef.querySelector<HTMLElement>('.hero-scroll-hint');
  const techMeta = heroRef.querySelector<HTMLElement>('.hero-tech-meta');
  const ctrlContainer = heroRef.querySelector<HTMLElement>('.hero-3d-controller');

  if (!headline || !ctrlContainer) return null;

  const ctx = gsap.context(() => {
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef,
        start: 'top top',
        end: '+=3000',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      }
    });

    // Phase 1: Intro text fades (0 - 0.25)
    master
      .fromTo(headline,
        { y: 0, opacity: 1 },
        { y: -120, opacity: 0, duration: 0.25, ease: 'none' }, 0)
      .fromTo(subline,
        { y: 0, opacity: 1 },
        { y: -80, opacity: 0, duration: 0.2, ease: 'none' }, 0)
      .fromTo(cta,
        { y: 0, opacity: 1 },
        { y: -40, opacity: 0, duration: 0.15, ease: 'none' }, 0)
      .fromTo(techMeta,
        { opacity: 1 },
        { opacity: 0, duration: 0.15, ease: 'none' }, 0)
      .fromTo(scrollHint,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -20, duration: 0.1, ease: 'none' }, 0);

    if (controllerAPI) {
      // Phase 1: Controller starts dominant (0 - 0.25)
      master.to(ctrlContainer, {
        xPercent: -10,
        yPercent: -15,
        scale: 0.8,
        duration: 0.25,
        ease: 'none',
      }, 0);

      // Also rotate the 3D model itself
      const ctrlObj = controllerAPI.getObject();
      if (ctrlObj) {
        master.to(ctrlObj.rotation, {
          y: 0.4,
          x: -0.3,
          z: 0.1,
          duration: 0.25,
          ease: 'none',
        }, 0);
        master.to(ctrlObj.position, {
          x: -0.5,
          y: 0.3,
          z: 0.5,
          duration: 0.25,
          ease: 'none',
        }, 0);
      }
    }

    // Phase 2: Controller moves and scales down (0.25 - 0.55)
    if (controllerAPI) {
      master.to(ctrlContainer, {
        xPercent: 15,
        yPercent: 5,
        scale: 0.4,
        duration: 0.3,
        ease: 'none',
      }, 0.25);

      const ctrlObj = controllerAPI.getObject();
      if (ctrlObj) {
        master.to(ctrlObj.rotation, {
          y: 0.1,
          x: -0.05,
          z: 0,
          duration: 0.3,
          ease: 'none',
        }, 0.25);
        master.to(ctrlObj.position, {
          x: 1.2,
          y: -0.4,
          z: 1.0,
          duration: 0.3,
          ease: 'none',
        }, 0.25);
      }

      // Phase 3: Controller fades out (0.55 - 0.75)
      master.to(ctrlContainer, {
        opacity: 0,
        xPercent: -100,
        yPercent: 80,
        scale: 0.05,
        duration: 0.2,
        ease: 'none',
      }, 0.55);

      const ctrlObj2 = controllerAPI.getObject();
      if (ctrlObj2) {
        master.to(ctrlObj2.rotation, {
          y: 3,
          duration: 0.2,
          ease: 'none',
        }, 0.55);
      }
    }

    // Phase 4: Final fade (0.75 - 1.0)
    master.to({}, { duration: 0.25 }, 0.75);

  }, heroRef);

  return ctx;
}
