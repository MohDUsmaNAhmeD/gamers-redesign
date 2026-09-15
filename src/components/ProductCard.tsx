import { useRef, useEffect, useCallback } from 'react';
import { ArrowUpRight, Heart, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, money, type Product } from '../lib/store';
import gsap from 'gsap';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ProductCard({ product }: { product: Product }) {
  const { cart, mutate, busy } = useStore();
  const saved = cart.saved_items.includes(product.id);
  const added = cart.items.some(item => item.product_id === product.id);
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const onEnter = useCallback(() => {
    if (reduced || !cardRef.current) return;
    const img = imageRef.current?.querySelector('img');
    if (img) gsap.to(img, { scale: 1.03, duration: 0.7, ease: 'power2.out' });
  }, []);

  const onLeave = useCallback(() => {
    if (reduced || !cardRef.current) return;
    const img = imageRef.current?.querySelector('img');
    if (img) gsap.to(img, { scale: 1, duration: 0.7, ease: 'power2.out' });
  }, []);

  useEffect(() => {
    if (reduced || !cardRef.current) return;
    const card = cardRef.current;
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, [onEnter, onLeave]);

  useEffect(() => {
    if (added && addBtnRef.current) {
      gsap.fromTo(addBtnRef.current, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }, [added]);

  return (
    <article className="product-card" ref={cardRef} data-product-id={product.id}>
      <div className="product-image-wrap" ref={imageRef}>
        <Link to={'/product/' + product.slug} className="product-image-link" aria-label={'View ' + product.name}>
          <img src={product.image} alt={product.name} loading="lazy" />
          <span className="quick-view">Explore product <ArrowUpRight size={15} /></span>
        </Link>
        {product.badge && (
          <span className={'product-badge ' + (product.original_price ? 'deal-badge' : '')}>
            {product.badge}
          </span>
        )}
        <button
          className={'save-button ' + (saved ? 'is-saved' : '')}
          aria-label={(saved ? 'Unsave ' : 'Save ') + product.name}
          aria-pressed={saved}
          disabled={busy}
          onClick={() => void mutate('save', product.id)}
        >
          <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.brand}</span>
          <span className="condition">{product.condition}</span>
        </div>
        <Link to={'/product/' + product.slug} className="product-name">{product.name}</Link>
        <div className="product-bottom">
          <div>
            <span className="product-price">{money(product.price)}</span>
            {product.original_price && <del>{money(product.original_price)}</del>}
          </div>
          <button
            ref={addBtnRef}
            className={'add-button ' + (added ? 'added' : '')}
            onClick={() => void mutate('add', product.id)}
            disabled={busy || !product.stock}
            aria-label={'Add ' + product.name + ' to cart'}
          >
            {added ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}
