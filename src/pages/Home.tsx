import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useStore } from '../lib/store';

export function CatalogState(){ const {loading,error,load}=useStore(); if(error) return <div className="catalog-error"><h3>Marketplace unavailable.</h3><p>{error}</p><button className="button primary" onClick={()=>void load()}>Try again</button></div>; if(loading) return <div className="product-grid">{Array.from({length:4},(_,i)=><div className="product-skeleton" key={i}><div/><span/><span/></div>)}</div>; return null; }

export default function Home(){
  const {products,categories,loading,error}=useStore();
  const featured=products.filter(p=>p.featured).slice(0,4);
  const spotlight=products.find(p=>p.category==='consoles') || products[0];
  return <main>
    <Hero/>
    <section className="promise-strip"><div><BadgeCheck/><span><strong>Verified gear</strong>Every listing inspected</span></div><div><Truck/><span><strong>Fast dispatch</strong>Tracked delivery</span></div><div><ShieldCheck/><span><strong>2-year cover</strong>Play with confidence</span></div><div><Headphones/><span><strong>Human support</strong>Players helping players</span></div></section>

    <section className="console-handoff" id="featured">
      <div className="console-handoff-inner"><div><h2>One console.<br /><em>Every world.</em></h2><p>The controller finds its home. Explore the PlayStation 5 collection, tuned for instant load times and all-day sessions.</p><Link className="button primary" to="/shop?category=consoles">Shop PS5 systems <ArrowRight size={16} /></Link></div><div className="handoff-orbit"><img src="/images/reference-console-remove-bg.png" alt="PlayStation 5 console" /></div></div>
    </section>

    <section className="section-shell categories-section">
      <div className="section-heading"><div><span className="micro">CURATED DEPARTMENTS</span><h2>Build your world.</h2></div><Link to="/shop">Browse everything <ArrowUpRight size={16}/></Link></div>
      <div className="category-grid">{categories.slice(0,6).map((c,i)=><motion.div key={c.id} whileHover={{y:-6}} transition={{duration:.25}} className={`category-tile category-${i}`}><Link to={`/shop?category=${c.slug}`}><span className="tile-index">0{i+1}</span><img src={c.image} alt={c.name}/><div><h3>{c.name}</h3><p>{i===0?'Precision, redefined.':i===1?'Power without compromise.':i===2?'Hear every detail.':'Made for your setup.'}</p><ArrowUpRight/></div></Link></motion.div>)}</div>
    </section>

    <section className="section-shell marketplace-section" id="featured">
      <div className="section-heading"><div><span className="micro">THE MARKETPLACE</span><h2>Objects of desire.</h2><p>Highly considered hardware from trusted makers.</p></div><div className="section-tabs"><span>Featured</span><Link to="/shop?sort=newest">New</Link><Link to="/shop?deals=true">Offers</Link></div></div>
      {error||loading?<CatalogState/>:<div className="product-grid">{featured.map(p=><ProductCard key={p.id} product={p}/>)}</div>}
      <div className="center-action"><Link to="/shop" className="button dark">Enter marketplace <ArrowRight size={17}/></Link></div>
    </section>

    {spotlight&&<section className="spotlight"><div className="spotlight-copy"><span className="micro light">EDITOR'S CHOICE</span><h2>{spotlight.name}</h2><p>{spotlight.description || spotlight.tagline}</p><div className="spotlight-meta"><span>From</span><strong>${spotlight.price}</strong></div><Link className="button light-button" to={`/product/${spotlight.slug}`}>Explore the system <ArrowRight size={17}/></Link></div><div className="spotlight-art"><div className="spotlight-ring"/><img src={spotlight.image} alt={spotlight.name}/><span>ENGINEERED<br/>TO DISAPPEAR.</span></div></section>}

    <section className="editorial section-shell"><div className="editorial-card editorial-main"><span className="micro">NEXUS SELECT</span><h2>Less choice.<br/>Better choices.</h2><p>We cut through endless listings to surface gear with exceptional design, performance and longevity.</p><Link to="/support/about">How we curate <ArrowUpRight size={15}/></Link></div><div className="editorial-card editorial-image"><img src="/images/nobg/monitors.png" alt="Premium gaming display"/><div><span className="micro light">SETUP STORIES</span><h3>A calmer desk.<br/>A sharper game.</h3><Link to="/shop?category=monitors">Explore displays <ArrowRight size={15}/></Link></div></div></section>
  </main>;
}
