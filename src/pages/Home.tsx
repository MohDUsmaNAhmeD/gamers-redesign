import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gamepad2, Headphones, ShieldCheck, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useStore } from '../lib/store';

gsap.registerPlugin(ScrollTrigger);
export function CatalogState() {
  const { loading, error, load } = useStore();
  if (error) return <div className="catalog-error" role="alert"><h3>Taking a quick respawn.</h3><p>{error}</p><button className="button primary" onClick={() => void load()}>Reload marketplace <ArrowRight size={16}/></button></div>;
  if (loading) return <div className="product-grid" role="status" aria-label="Loading products">{Array.from({length:4}, (_,i) => <div className="product-skeleton" key={i}><div/><span/><span/></div>)}</div>;
  return null;
}
export default function Home() {
  const { products, categories, loading, error } = useStore();
  const [tab, setTab] = useState('Featured');
  const home = useRef<HTMLElement>(null);
  const selected = [...products].sort((a,b) => tab === 'New arrivals' ? b.id-a.id : Number(b.featured)-Number(a.featured)).filter(p => tab !== 'The deals' || p.original_price).slice(0,4);
  const departments = categories.filter(c => ['consoles','controllers','headsets','keyboards','mice','accessories'].includes(c.slug));
  useEffect(() => {
    if (!home.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => gsap.fromTo(el, { y:24, opacity:0 }, { y:0, opacity:1, duration:.7, ease:'power3.out', scrollTrigger:{trigger:el,start:'top 94%',once:true} }));
      }, home);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  return <main className="home" ref={home}>
    <Hero/>
    <div className="brand-strip"><div className="section-shell brand-strip-inner"><span className="brand-strip-label">GREAT GEAR.<br/>ICONIC MAKERS.</span><span className="brand-playstation"><Gamepad2/> PlayStation</span><span className="brand-xbox"><span>⊗</span> XBOX</span><span className="brand-nintendo">Nintendo</span><span className="brand-razer">RAZER</span><span className="brand-steelseries">steelseries</span><span className="brand-asus">ASUS<span>REPUBLIC OF GAMERS</span></span></div></div>
    <section className="section-shell categories-section" data-reveal>
      <div className="section-heading"><div><span className="eyebrow"><span className="small-lime-line"/> CHOOSE YOUR PLAY</span><h2>YOUR WORLD. <span>UPGRADED.</span></h2></div><Link className="text-link" to="/shop">Shop all categories <ArrowUpRight size={16}/></Link></div>
      <div className="category-grid">{departments.map((c, i) => <Link key={c.id} className="category-tile" to={`/shop?category=${c.slug}`}><span className="tile-index">0{i+1} /</span><div className="category-image"><img src={c.image} alt={c.name} loading="lazy"/></div><div className="category-name"><h3>{c.name}</h3><ArrowUpRight size={16}/></div></Link>)}</div>
    </section>
    <section className="section-shell marketplace-section" id="featured" data-reveal>
      <div className="section-heading"><div><span className="eyebrow"><span className="small-lime-line"/> WORTH A PLACE IN YOUR SETUP</span><h2>ALL GEAR. <span>NO COMPROMISE.</span></h2></div><Link className="text-link" to="/shop">Explore the marketplace <ArrowUpRight size={16}/></Link></div>
      <div className="home-product-toolbar"><div className="section-tabs" role="tablist" aria-label="Product collections">{['Featured','New arrivals','The deals'].map(t => <button key={t} role="tab" id={`tab-${t.replaceAll(' ','-')}`} aria-selected={t === tab} aria-controls="home-products" tabIndex={t === tab ? 0 : -1} className={t === tab ? 'active' : ''} onClick={() => setTab(t)} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const tabs = ['Featured','New arrivals','The deals']; const next = tabs[(tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; setTab(next); document.getElementById(`tab-${next.replaceAll(' ','-')}`)?.focus(); } }}>{t}{t === 'The deals' && <span className="tab-dot"/>}</button>)}</div><Link className="filter-link" to="/shop"><SlidersHorizontal size={14}/> Filter & sort</Link></div>
      <div id="home-products" role="tabpanel" aria-labelledby={`tab-${tab.replaceAll(' ','-')}`} tabIndex={0}>{error || loading ? <CatalogState/> : <div className="product-grid">{selected.map(p => <ProductCard key={p.id} product={p}/>)}</div>}</div>
      <div className="marketplace-bottom"><span>Considered choices. Not endless scrolling.</span><Link to="/shop">Find your next upgrade <ArrowRight size={16}/></Link></div>
    </section>
    <section className="editorial section-shell" data-reveal>
      <Link className="editorial-card editorial-image" to="/shop?category=headsets"><img src="/images/headsets-detail.webp" alt="Premium wireless gaming headset" loading="lazy"/><div className="editorial-copy"><span className="eyebrow">EVERY FOOTSTEP. EVERY FREQUENCY.</span><h2>DON’T JUST PLAY IT.<br/><span>FEEL IT.</span></h2><span className="editorial-link">Discover gaming audio <ArrowUpRight size={18}/></span></div><span className="editorial-corner"><Headphones size={19}/></span></Link>
      <Link className="editorial-card editorial-lime" to="/support/gear-guide"><span className="eyebrow">A LITTLE KNOW-HOW. A BIG ADVANTAGE.</span><div className="guide-art" aria-hidden="true"><Gamepad2 strokeWidth={.85}/><span>+</span></div><div><h2>YOUR SETUP.<br/>YOUR RULES.</h2><p>Find your perfect match with our no-nonsense gear guide.</p><span className="editorial-link">Build a better setup <ArrowUpRight size={18}/></span></div></Link>
    </section>
    <section className="promise-strip section-shell" data-reveal><Link to="/support/about"><ShieldCheck/><span><strong>Good gear. Zero guesswork.</strong>Carefully considered collections.</span><ArrowUpRight size={14}/></Link><Link to="/support/gear-guide"><Zap/><span><strong>Made for your next level.</strong>The right upgrade for every player.</span><ArrowUpRight size={14}/></Link><Link to="/support/contact"><Headphones/><span><strong>Players come first.</strong>Straight answers. No extra noise.</span><ArrowUpRight size={14}/></Link></section>
    <section className="closing-section section-shell" data-reveal><span className="closing-icon"><Sparkles size={25}/></span><span className="eyebrow">LESS SCROLLING. MORE PLAYING.</span><h2>YOUR NEXT LEVEL<br/>IS <span>RIGHT HERE.</span></h2><Link to="/shop" className="button primary">Let’s find your gear <ArrowUpRight size={18}/></Link><span className="closing-code">GE / PLAYER ONE / READY</span></section>
  </main>;
}
