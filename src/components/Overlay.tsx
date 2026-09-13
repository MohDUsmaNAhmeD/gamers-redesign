import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
export default function Overlay({ children, title, close, wide = false }: { children: ReactNode; title: string; close: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const background = document.querySelectorAll<HTMLElement>('.site-header, .announcement, #main-content, .site-footer');
    const states = [...background].map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    return () => { background.forEach((element, index) => { element.inert = states[index]; }); };
  }, []);
  useEffect(() => { const previous = document.activeElement as HTMLElement; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; ref.current?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); if (event.key === 'Tab') { const elements = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]'); if (!elements?.length) return; const first = elements[0], last = elements[elements.length - 1]; if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }; document.addEventListener('keydown', key); return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); }; }, [close]);
  return <motion.div className={'overlay-backdrop ' + (wide ? 'center-overlay' : '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={'overlay-panel ' + (wide ? 'wide-panel' : '')} initial={{ x: wide ? 0 : 60, y: wide ? 20 : 0 }} animate={{ x: 0, y: 0 }} exit={{ x: wide ? 0 : 60, y: wide ? 20 : 0 }} transition={{ duration: .25 }}><div className="overlay-heading"><div><span className="eyebrow">THE NEXUS EXPERIENCE</span><h2>{title}</h2></div><button className="icon-button" onClick={close} aria-label="Close dialog"><X size={22} /></button></div>{children}</motion.div></motion.div>;
}
