import { useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import ShoppingOverlays from './components/ShoppingOverlays';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Support from './pages/Support';
import './store.css';

function Mark() {
  return <Link className="mark" to="/" aria-label="Nexus home"><span className="mark-glyph">N</span><span>NEXUS</span></Link>;
}

function Header() {
  const { cart, categories, setCartOpen, setSearchOpen, setSavedOpen } = useStore();
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { setMenu(false); setMega(false); }, [location.pathname]);
  useEffect(() => { const onScroll = () => setSolid(scrollY > 24); addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => removeEventListener('scroll', onScroll); }, []);
  useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } }; addEventListener('keydown', key); return () => removeEventListener('keydown', key); }, [setSearchOpen]);
  return <header className={`topbar ${solid ? 'is-solid' : ''}`}>
    <div className="nav-shell">
      <Mark />
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/shop">Marketplace</NavLink>
        <button onClick={() => setMega(v => !v)} aria-expanded={mega}>Hardware <ChevronDown size={13}/></button>
        <NavLink to="/shop?sort=newest">New drops</NavLink>
        <NavLink className="nav-sale" to="/shop?deals=true">Offers</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="search-pill" onClick={() => setSearchOpen(true)}><Search size={16}/><span>Search gear</span><kbd>Ctrl K</kbd></button>
        <button className="nav-icon desktop-only" onClick={() => setSavedOpen(true)} aria-label="Saved items"><Heart size={19}/></button>
        <button className="bag-button" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>Bag</span><b>{count}</b></button>
        <button className="nav-icon menu-button" onClick={() => setMenu(v => !v)} aria-label="Toggle menu">{menu ? <X/> : <Menu/>}</button>
      </div>
    </div>
    <AnimatePresence>{mega && <motion.div className="mega-menu" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
      <div className="mega-inner"><div><span className="micro">SHOP BY SYSTEM</span><h3>Find your setup.</h3><p>Purpose-built gear, selected for the way you play.</p></div><div className="mega-links">{categories.map(c => <Link key={c.id} to={`/shop?category=${c.slug}`}><img src={c.image} alt=""/><span>{c.name}</span><ArrowRight size={14}/></Link>)}</div></div>
    </motion.div>}</AnimatePresence>
    <AnimatePresence>{menu && <motion.nav className="mobile-menu" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}><Link to="/shop">Marketplace</Link>{categories.map(c => <Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}<button onClick={() => setSavedOpen(true)}>Saved items</button></motion.nav>}</AnimatePresence>
  </header>;
}

function Footer() {
  const { categories } = useStore();
  return <footer className="footer"><div className="footer-shell">
    <div className="footer-lead"><Mark/><h2>Designed for the<br/>next move.</h2><p>A concept marketplace for remarkable gaming hardware.</p></div>
    <div className="footer-columns"><div><span>Marketplace</span>{categories.slice(0,4).map(c=><Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}</div><div><span>Explore</span><Link to="/shop?sort=newest">New drops</Link><Link to="/shop?deals=true">Offers</Link><Link to="/support/gear-guide">Gear guide</Link></div><div><span>Support</span><Link to="/support/shipping">Delivery</Link><Link to="/support/warranty">Returns</Link><Link to="/support/contact">Help</Link></div></div>
    <div className="footer-bottom"><span>Copyright {new Date().getFullYear()} Nexus Concept Store</span><span>Demo experience - No real payment or fulfillment</span></div>
  </div></footer>;
}

function Shell() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return <><a href="#main" className="skip-link">Skip to content</a><Header/><div id="main"><Routes>
    <Route path="/" element={<Home/>}/><Route path="/shop" element={<Catalog/>}/><Route path="/product/:slug" element={<Product key={location.pathname}/>}/><Route path="/support/:topic" element={<Support/>}/>
    <Route path="*" element={<main className="empty-state route-empty"><span className="micro">404</span><h1>Lost in the lobby.</h1><Link className="button primary" to="/">Return home <ArrowRight size={17}/></Link></main>}/>
  </Routes></div><Footer/><ShoppingOverlays/></>;
}

export default function Storefront(){ return <MotionConfig reducedMotion="user"><BrowserRouter><StoreProvider><Shell/></StoreProvider></BrowserRouter></MotionConfig>; }
