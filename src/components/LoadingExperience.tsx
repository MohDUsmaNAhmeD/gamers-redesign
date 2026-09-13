import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import gsap from 'gsap';

const STATUS = ['Initializing', 'Loading gear database', 'Syncing your setup', 'Ready to play'];
const HEADLINE = 'Booting up';
const FACE_BUTTONS = [
  { x: 186, y: 39 },
  { x: 197, y: 50 },
  { x: 186, y: 61 },
  { x: 175, y: 50 },
];

function SplitChars({ text }: { text: string }) {
  return <>
    {text.split('').map((char, index) => (
      <span className="char" key={index} aria-hidden="true">{char === ' ' ? '\u00A0' : char}</span>
    ))}
  </>;
}

export default function LoadingExperience({ ready, onComplete, onSkip }: {
  ready: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const consoleImg = useRef<HTMLImageElement>(null);
  const screenFlicker = useRef<HTMLDivElement>(null);
  const bootLogo = useRef<HTMLImageElement>(null);
  const barFill = useRef<HTMLSpanElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const progress = useRef({ value: 0 });
  const progressTween = useRef<gsap.core.Tween | null>(null);
  const ambient = useRef<gsap.core.Timeline | null>(null);
  const departure = useRef<gsap.core.Timeline | null>(null);
  const autoEnter = useRef<gsap.core.Tween | null>(null);
  const pausedRef = useRef(false);
  const leaving = useRef(false);
  const reduced = useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [assetsReady, setAssetsReady] = useState(false);
  const [percent, setPercent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);

  const litButtons = Math.min(4, Math.floor(percent / 25));
  const statusLabel = paused ? 'Paused' : complete ? 'Ready' : STATUS[Math.min(3, Math.floor(percent / 25))];
  const motes = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: 6 + ((i * 37) % 92),
    top: 8 + ((i * 53) % 84),
    size: 2 + (i % 3),
    delay: (i % 8) * 0.35,
  })), []);

  const enter = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    autoEnter.current?.kill();
    departure.current = gsap.timeline({ onComplete });
    if (reduced.current) {
      departure.current.to(root.current, { autoAlpha: 0, duration: .12 });
    } else {
      departure.current
        .to(screenFlicker.current, { opacity: 1, duration: .04, repeat: 4, yoyo: true, ease: 'none' }, 0)
        .to(stage.current, { scale: 1.08, y: -24, autoAlpha: 0, duration: .6, ease: 'power3.in' }, .06)
        .to('.welcome-headline, .welcome-loader, .welcome-controller', { y: -20, autoAlpha: 0, duration: .45, ease: 'power3.in', stagger: .03 }, .06)
        .to(root.current, { autoAlpha: 0, duration: .5, ease: 'power2.inOut' }, '-=.25');
    }
  }, [onComplete]);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const tl = gsap.timeline({ delay: .08 });
      if (reduced.current) {
        gsap.set(['.welcome-mote', '.welcome-console-stage', '.welcome-headline', '.welcome-loader', '.welcome-controller'], { autoAlpha: 1, y: 0, x: 0 });
      } else {
        gsap.set('.welcome-console-stage', { y: 140, autoAlpha: 0, rotate: -4, scale: 0.96 });
        gsap.set(bootLogo.current, { autoAlpha: 0, scale: 0.6 });
        gsap.set('.char', { y: 30, autoAlpha: 0, rotateX: -80 });
        gsap.set('.welcome-loader', { y: 20, autoAlpha: 0 });
        gsap.set('.welcome-controller', { y: 16, autoAlpha: 0 });
        gsap.set('.welcome-mote', { autoAlpha: 0, scale: 0 });
        gsap.set('.welcome-glow', { scale: 0.6, opacity: 0 });

        tl.to('.welcome-glow', { scale: 1, opacity: 0.55, duration: 1.8, ease: 'power2.out' }, 0)
          .to('.welcome-mote', { autoAlpha: 1, scale: 1, duration: 0.8, stagger: { each: 0.04, from: 'random' } }, 0.1)
          .to('.welcome-console-stage', { y: 0, autoAlpha: 1, rotate: 0, scale: 1, duration: 1.3, ease: 'back.out(1.2)' }, 0.15)
          .to(screenFlicker.current, { opacity: 0.9, duration: 0.04, repeat: 6, yoyo: true, ease: 'none' }, 0.6)
          .set(screenFlicker.current, { opacity: 0 }, 1.0)
          .to(bootLogo.current, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2.5)' }, 0.85)
          .to('.char', { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.7, ease: 'back.out(1.5)', stagger: 0.025 }, 1.0)
          .to('.welcome-loader', { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 1.2)
          .to('.welcome-controller', { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 1.35);

        ambient.current = gsap.timeline({ repeat: -1, yoyo: true, delay: 1.8 });
        ambient.current
          .to('.welcome-glow', { scale: 1.18, opacity: 0.8, duration: 5, ease: 'sine.inOut' }, 0)
          .to('.welcome-console-stage', { y: -14, rotate: 1.5, duration: 5, ease: 'sine.inOut' }, 0)
          .to(bootLogo.current, { opacity: 0.75, duration: 3, ease: 'sine.inOut' }, 0)
          .to('.welcome-mote', { y: '-=16', duration: 6, ease: 'sine.inOut', stagger: { each: 0.1, from: 'random' } }, 0);
      }
    }, root);
    return () => { context.revert(); departure.current?.kill(); autoEnter.current?.kill(); ambient.current?.kill(); };
  }, []);

  useEffect(() => {
    if (reduced.current) return;
    const node = root.current;
    if (!node) return;
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(stage.current, { rotateY: x * 12, rotateX: y * -12, duration: 0.8, ease: 'power3.out', transformPerspective: 800 });
    };
    const onLeave = () => gsap.to(stage.current, { rotateY: 0, rotateX: 0, duration: 1, ease: 'power3.out' });
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => { node.removeEventListener('pointermove', onMove); node.removeEventListener('pointerleave', onLeave); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const assets = ['/images/gamecraft-logo.webp', '/images/reference-console.webp'].map(src => {
      const image = new Image(); image.src = src;
      return image.decode();
    });
    Promise.allSettled(assets).then(() => { if (!cancelled) setAssetsReady(true); });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onSkip(); };
    window.addEventListener('keydown', escape);
    const timeout = setTimeout(() => { if (!cancelled) setAssetsReady(true); }, 5000);
    root.current?.focus({ preventScroll: true });
    return () => { cancelled = true; clearTimeout(timeout); window.removeEventListener('keydown', escape); };
  }, [onSkip]);

  useEffect(() => {
    const canFinish = ready && assetsReady;
    progressTween.current?.kill();
    progressTween.current = gsap.to(progress.current, {
      value: canFinish ? 100 : 82,
      duration: reduced.current ? 0.45 : Math.max(0.9, (100 - progress.current.value) / 30),
      ease: canFinish ? 'power2.inOut' : 'power2.out',
      paused: pausedRef.current,
      onUpdate: () => {
        const value = progress.current.value;
        if (barFill.current) gsap.set(barFill.current, { scaleX: value / 100 });
        if (knob.current) gsap.set(knob.current, { left: `${value}%`, rotate: Math.sin(value / 5) * 10 });
        setPercent(Math.round(value));
      },
      onComplete: () => {
        if (!canFinish) return;
        setComplete(true);
        autoEnter.current = gsap.delayedCall(1.2, enter).paused(pausedRef.current);
      },
    });
    return () => { progressTween.current?.kill(); };
  }, [ready, assetsReady, enter]);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    progressTween.current?.paused(pausedRef.current);
    ambient.current?.paused(pausedRef.current);
    autoEnter.current?.paused(pausedRef.current);
  };

  return <div className="loading-splash welcome-experience" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Welcome to GameCraft Hub">
    <div className="welcome-glow" aria-hidden="true" />
    <div className="welcome-motes" aria-hidden="true">
      {motes.map(mote => (
        <span key={mote.id} className="welcome-mote" style={{ left: `${mote.left}%`, top: `${mote.top}%`, width: mote.size, height: mote.size, animationDelay: `${mote.delay}s` }} />
      ))}
    </div>
    <button className="welcome-skip" onClick={onSkip} aria-label="Skip intro">Skip <ArrowRight size={14} /></button>

    <div className="welcome-content">
      <div className="welcome-console-stage" ref={stage}>
        <span className="welcome-pedestal" aria-hidden="true" />
        <div className="welcome-console-frame">
          <img ref={consoleImg} className="welcome-console" src="/images/reference-console.webp" alt="" aria-hidden="true" width={1216} height={556} fetchPriority="high" />
          <div className="welcome-screen">
            <img ref={bootLogo} className="welcome-boot-logo" src="/images/gamecraft-logo.webp" alt="GameCraft Hub" width={120} height={120} />
            <div ref={screenFlicker} className="welcome-screen-flicker" aria-hidden="true" />
          </div>
        </div>
      </div>

      <h2 className="welcome-headline"><SplitChars text={HEADLINE} /><span className="sr-only">{HEADLINE}.</span></h2>

      <div className="welcome-loader">
        <div className="welcome-progress-row">
          <span className="welcome-status" role="status">{statusLabel}</span>
          <span className="welcome-percent" aria-hidden="true">{percent}<small>%</small></span>
        </div>
        <div className="welcome-progress" role="progressbar" aria-label="Loading the experience" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span className="welcome-progress-track" />
          <span className="welcome-progress-fill" ref={barFill} />
          <div className="welcome-knob" ref={knob} aria-hidden="true"><i /><i /></div>
        </div>
        <div className="welcome-loader-controls">
          <button className="welcome-pause" onClick={toggle} aria-pressed={paused} aria-label={paused ? 'Resume loading animation' : 'Pause loading animation'}>{paused ? <Play size={12} /> : <Pause size={12} />}{paused ? 'Resume' : 'Pause'}</button>
          {complete && <button className="welcome-enter" onClick={enter}>Play <ArrowRight size={13} /></button>}
        </div>
      </div>

      <div className="welcome-controller" aria-hidden="true">
        <svg viewBox="0 0 220 118" className="welcome-pad-svg">
          <path className="pad-body" d="M46 20 C24 20 8 34 6 56 C4 76 14 96 32 100 C44 102 50 90 60 84 C72 77 84 74 110 74 C136 74 148 77 160 84 C170 90 176 102 188 100 C206 96 216 76 214 56 C212 34 196 20 174 20 C150 20 150 30 110 30 C70 30 70 20 46 20 Z" />
          <rect className="pad-trigger" x="24" y="9" width="34" height="9" rx="4.5" />
          <rect className="pad-trigger" x="162" y="9" width="34" height="9" rx="4.5" />
          <g className="pad-dpad">
            <rect x="40" y="48" width="10" height="28" rx="2" />
            <rect x="30" y="58" width="30" height="10" rx="2" />
          </g>
          <circle className="pad-stick" cx="88" cy="58" r="11" />
          <circle className="pad-stick" cx="132" cy="58" r="11" />
          {FACE_BUTTONS.map((pos, i) => (
            <circle key={i} className={`pad-face${i < litButtons ? ' lit' : ''}`} cx={pos.x} cy={pos.y} r="5.5" />
          ))}
        </svg>
      </div>
    </div>
  </div>;
}
