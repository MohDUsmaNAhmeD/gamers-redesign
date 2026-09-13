import { useState, lazy, Suspense, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Box, Cpu, Pause, Play, Radio, Sparkles, Zap } from 'lucide-react';
const ThreeScene = lazy(() => import('./ThreeScene'));
const finishes = [{ name: 'Glacier white', color: '#e9e8e4' }, { name: 'Midnight black', color: '#303137' }, { name: 'Electric lime', color: '#b7e452' }];

export default function Hero() {
  const [finish, setFinish] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => setFailed(true), []);
  return <div className={`experience ${ready && !failed ? 'scene-ready' : ''}`}>
    <div className="scene-track" aria-hidden="true"><div className="scene-sticky">
      {!failed && <Suspense fallback={null}><ThreeScene finish={finish} paused={paused} onReady={handleReady} onError={handleError}/></Suspense>}
    </div></div>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-atmosphere"/><div className="hero-outline" aria-hidden="true">PLAY.</div>
      <div className="hero-shell">
        <div className="hero-copy">
          <div className="launch-chip"><span className="live-dot"/> FOR THE LOVE OF THE GAME <span className="chip-year">/ 2026</span></div>
          <h1 id="hero-title">GOOD GEAR.<br/>GREAT <span>GAME.</span></h1>
          <p>Your next advantage starts here. Discover standout<br className="desktop-break"/> consoles, precision gear, and everything in between.</p>
          <div className="hero-actions"><Link to="/shop" className="button primary">Explore marketplace <ArrowUpRight size={18}/></Link><a href="#system" className="hero-secondary">Meet your next setup <ArrowRight size={16}/></a></div>
          <div className="hero-note"><span className="tiny-cross">✦</span> Curated for players. Built for what’s next.</div>
        </div>
        <div className="hero-art">
          <div className="art-reticle" aria-hidden="true"><span/><span/><span/><span/></div>
          <span className="art-edition">PLAYER ESSENTIALS — 001</span>
          <img className="controller-fallback" src="/images/hero-controller.webp" alt="White gaming controller" fetchPriority="high"/>
          <div className="model-callout callout-top"><span className="callout-dot"/><div>FEEL EVERY MOMENT<small>Immersive haptic feedback</small></div></div>
          <div className="model-callout callout-bottom"><span className="callout-dot"/><div>PRECISION. IN YOUR HANDS.<small>Adaptive triggers. Total control.</small></div></div>
          <div className="hero-product-caption"><div><span className="micro">THE CONTROLLER COLLECTION</span><h3>Play has a new feeling.</h3></div><Link to="/shop?category=controllers" className="circle-link" aria-label="Shop controllers"><ArrowUpRight size={22}/></Link></div>
          <div className="hero-finish"><div className="finish-swatches" role="group" aria-label="Preview controller finish">{finishes.map((item, i) => <button key={item.name} onClick={() => setFinish(i)} className={finish === i ? 'selected' : ''} aria-pressed={finish === i} aria-label={item.name} title={item.name} style={{ '--swatch': item.color } as React.CSSProperties}/>)}</div><span aria-live="polite">{finishes[finish].name}</span><span className="finish-preview">3D finish preview</span></div>
        </div>
      </div>
      <div className="hero-bottom section-shell"><a href="#system"><span className="scroll-icon"><ArrowDown size={14}/></span> SCROLL TO CONNECT</a><span className="hero-bottom-center"><Box size={13}/>{failed ? 'PRODUCT SHOWCASE' : ready ? 'REAL-TIME 3D. REAL POSSIBILITIES.' : 'PREPARING YOUR 3D EXPERIENCE…'}</span><button className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}>{paused ? <Play size={12}/> : <Pause size={12}/>}<span>{paused ? 'MOTION PAUSED' : 'MOTION ON'}</span></button></div>
    </section>
    <section id="system" className="system-section" aria-labelledby="system-title">
      <div className="section-shell system-shell">
        <div className="system-copy"><span className="eyebrow"><span className="small-lime-line"/> THE PERFECT PAIRING</span><h2 id="system-title">ONE SYSTEM.<br/>ENDLESS<br/><span>POSSIBILITIES.</span></h2><p>A world worth getting lost in. Pair your controller with PlayStation 5 and make every moment feel extraordinary.</p><div className="system-specs"><div><Zap size={18}/><strong>Lightning fast</strong><small>Ultra-high-speed SSD</small></div><div><Cpu size={18}/><strong>Unreal detail</strong><small>Ray-traced worlds</small></div><div><AudioLines size={18}/><strong>Feel everything</strong><small>Immersive 3D audio</small></div></div><Link className="button primary" to="/shop?category=consoles">Discover PlayStation 5 <ArrowUpRight size={18}/></Link></div>
        <div className="system-art"><span className="system-watermark" aria-hidden="true">PS5</span><img className="console-fallback" src="/images/consoles-detail.webp" alt="PlayStation 5 console" loading="lazy"/><span className="connection-status"><Radio size={14}/><span className="status-pairing">READY TO CONNECT</span><span className="status-connected">CONNECTED. READY TO PLAY.</span></span><div className="console-label"><span>PLAYSTATION®5</span><small>Console + controller. Better together.</small></div><small className="concept-note">Concept docking visualization. Accessories sold separately.</small></div>
      </div>
    </section>
  </div>;
}
export { Hero };
