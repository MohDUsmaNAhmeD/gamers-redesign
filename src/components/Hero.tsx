import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Box, Sparkles } from 'lucide-react';
import ControllerModel from './ControllerModel';

const finishes = [
  {name:'Lunar', color:'#e8e8e3'},
  {name:'Obsidian', color:'#2c2d31'},
  {name:'Volt', color:'#bbff35'},
];

export default function Hero(){
  const [finish, setFinish] = useState(0);
  return <section className="hero">
    <div className="hero-aurora"/><div className="hero-grid"/>
    <div className="hero-shell">
      <motion.div className="hero-copy" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.8,ease:[.22,1,.36,1]}}>
        <span className="launch-chip"><Sparkles size={13}/> THE 2026 DROP</span>
        <h1>Control the<br/><em>impossible.</em></h1>
        <p>Meet the Nexus One. Precision-milled controls, adaptive response and a form that feels inevitable.</p>
        <div className="hero-actions"><Link to="/shop?category=controllers" className="button primary">Shop controllers <ArrowRight size={17}/></Link><Link to="/shop" className="button ghost">Explore marketplace</Link></div>
        <div className="hero-finish"><span>Finish</span><div>{finishes.map((item,i)=><button key={item.name} className={finish===i?'active':''} onClick={()=>setFinish(i)} aria-label={item.name}><i style={{background:item.color}}/>{item.name}</button>)}</div></div>
      </motion.div>
      <motion.div className={`hero-product finish-${finish}`} initial={{opacity:0,scale:.86,rotate:-5}} animate={{opacity:1,scale:1,rotate:0}} transition={{duration:1.1,ease:[.16,1,.3,1],delay:.1}}>
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <ControllerModel key={finish}/>
        <div className="model-hint"><Box size={14}/><span>INTERACTIVE 3D</span><small>Move your pointer</small></div>
      </motion.div>
      <div className="hero-specs"><div><span>01</span><strong>0.2 ms</strong><small>Rapid response</small></div><div><span>02</span><strong>40 hr</strong><small>Battery life</small></div><div><span>03</span><strong>241 g</strong><small>Balanced weight</small></div></div>
    </div>
    <a className="scroll-cue" href="#featured"><span>DISCOVER</span><ArrowDown size={14}/></a>
  </section>;
}

export { Hero };
