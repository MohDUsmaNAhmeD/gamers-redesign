import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, X, Command } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import ShoppingOverlays from './components/ShoppingOverlays';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Support from './pages/Support';
import './store.css';

function Mark() {
  return <Link className="mark" to="/" aria-label="Gamers End home"><img src="/images/provided-logo.png" alt="Shared GameCraft Hub emblem" width="44" height="44"/><span>GAMERS<span className="mark-end">END<span className="mark-dot">.</span></span></span></Link>;
}
function Header() {
  const { cart, categories, setCartOpen, setSearchOpen, setSavedOpen } = useStore();
  const [menu, setMenu] = useState(false); const [mega, setMega] = useState(false); const [solid, setSolid] = useState(false);
  const location = useLocation(); const header = useRef<HTMLElement>(null); const menuButton = useRef<HTMLButtonElement>(null);
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { setMenu(false); setMega(false); }, [location.pathname, location.search]);
  useEffect(() => { const onScroll = () => setSolid(scrollY > 24); addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => removeEventListener('scroll', onScroll); }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setMenu(false); setMega(false); setSearchOpen(true); }
      if (e.key === 'Escape') { setMenu(false); setMega(false); menuButton.current?.focus(); }
    };
    const outside = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) { setMega(false); setMenu(false); } };
    addEventListener('keydown', key); addEventListener('pointerdown', outside);
    return () => { removeEventListener('keydown', key); removeEventListener('pointerdown', outside); };
  }, [setSearchOpen]);
  return <header ref={header} className={`topbar ${solid ? 'is-solid' : ''}`}>
    <div className="nav-shell"><Mark/><nav className="main-nav" aria-label="Main navigation">
      <NavLink to="/shop" end className={!location.search && location.pathname === '/shop' ? 'active' : ''}>Marketplace</NavLink>
      <button onClick={() => setMega(v => !v)} aria-expanded={mega} aria-controls="hardware-menu">Categories <ChevronDown size={12}/></button>
      <Link to="/shop?sort=newest" className={location.search === '?sort=newest' ? 'active' : ''}>New arrivals</Link>
      <Link className={`nav-sale ${location.search === '?deals=true' ? 'active' : ''}`} to="/shop?deals=true">The deals <span/></Link>
    </nav><div className="nav-actions">
      <button className="search-pill" onClick={() => setSearchOpen(true)} aria-label="Search marketplace"><Search size={16}/><span>Find your next upgrade</span><kbd><Command size={10}/> K</kbd></button>
      <button className="nav-icon desktop-only" onClick={() => setSavedOpen(true)} aria-label={`Saved items, ${cart.saved_items.length}`}><Heart size={19}/>{cart.saved_items.length > 0 && <i className="saved-dot"/>}</button>
      <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19}/><b>{count}</b></button>
      <button ref={menuButton} className="nav-icon menu-button" onClick={() => setMenu(v => !v)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="mobile-navigation">{menu ? <X/> : <Menu/>}</button>
    </div></div>
    <AnimatePresence>{mega && <motion.div id="hardware-menu" className="mega-menu" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><div className="mega-inner"><div><span className="micro">CHOOSE YOUR NEXT ADVANTAGE</span><h3>Every player.<br/>Every possibility.</h3><p>The right gear changes everything.</p><Link className="text-link" to="/shop">Shop all gear <ArrowUpRight size={16}/></Link></div><div className="mega-links">{categories.map(c => <Link key={c.id} to={`/shop?category=${c.slug}`}><img src={c.image} alt=""/><span>{c.name}</span><ArrowUpRight size={15}/></Link>)}</div></div></motion.div>}</AnimatePresence>
    <AnimatePresence>{menu && <motion.nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}><Link to="/shop">Marketplace <ArrowUpRight size={18}/></Link><Link to="/shop?sort=newest">New arrivals <ArrowUpRight size={18}/></Link><Link to="/shop?deals=true">The deals <ArrowUpRight size={18}/></Link><div className="mobile-categories">{categories.map(c => <Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}</div><button onClick={() => { setMenu(false); setSavedOpen(true); }}>Your saved items <Heart size={17}/></button></motion.nav>}</AnimatePresence>
  </header>;
}
function Footer() {
  const { categories } = useStore();
  return <footer className="footer"><div className="footer-shell"><div className="footer-top"><div className="footer-brand"><Mark/><p>For late nights. For the next win.<br/>For the love of the game.</p><span className="footer-location"><span className="live-dot"/> YOUR NEXT LEVEL STARTS HERE</span></div><div className="footer-columns"><div><span>THE MARKETPLACE</span>{categories.slice(0,4).map(c => <Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}</div><div><span>GOOD TO KNOW</span><Link to="/support/about">Our story</Link><Link to="/support/gear-guide">Gear guide</Link><Link to="/shop?sort=newest">New arrivals</Link><Link to="/shop?deals=true">The deals</Link></div><div><span>WE’VE GOT YOU</span><Link to="/support/contact">Help center</Link><Link to="/support/shipping">Delivery information</Link><Link to="/support/warranty">Returns & warranty</Link><Link to="/support/checkout">Checkout information</Link></div></div></div><div className="footer-wordmark" aria-hidden="true">GAMERS END<span>®</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Gamers End. All play. No compromise.</span><span>Concept store · No real payments or fulfillment.</span><Link to="/support/privacy">Privacy <ArrowUpRight size={12}/></Link><a href="#main" className="back-top">Back to top ↑</a></div></div></footer>;
}
function Shell() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  useEffect(() => { document.title = `${location.pathname === '/' ? 'Good gear. Great game.' : location.pathname === '/shop' ? 'The Marketplace' : location.pathname.startsWith('/product') ? 'Your Next Upgrade' : 'Player Support'} — Gamers End`; }, [location.pathname]);
  return <><a href="#main" className="skip-link">Skip to content</a><Header/><div id="main" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/shop" element={<Catalog/>}/><Route path="/product/:slug" element={<Product key={location.pathname}/>}/><Route path="/support/:topic" element={<Support/>}/><Route path="*" element={<main className="empty-state route-empty"><span className="micro">404 / WRONG LOBBY</span><h1>Let’s get you back in game.</h1><Link className="button primary" to="/">Return home <ArrowRight size={17}/></Link></main>}/></Routes></div><Footer/><ShoppingOverlays/></>;
}
export default function Storefront() { return <MotionConfig reducedMotion="user"><BrowserRouter><StoreProvider><Shell/></StoreProvider></BrowserRouter></MotionConfig>; }
