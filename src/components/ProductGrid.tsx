import React, { useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const products = [
    { id: 1, name: 'RTX 5090', price: '$1599', image: 'https://picsum.photos/id/1015/800/600' },
    { id: 2, name: 'PS5 Pro', price: '$699', image: 'https://picsum.photos/id/201/800/600' },
    { id: 3, name: 'Alienware 34"', price: '$1299', image: 'https://picsum.photos/id/29/800/600' },
    { id: 4, name: 'BlackShark V2', price: '$199', image: 'https://picsum.photos/id/201/800/600' },
  ];

  return (
    <section className="py-24 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-sm uppercase tracking-widest text-emerald-400">03</span>
            <h2 className="text-5xl font-bold tracking-tighter mt-2">Featured Products</h2>
          </div>
          <div className="flex gap-3">
            {['All', 'GPU', 'Console', 'Monitor'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 text-sm rounded-2xl transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-zinc-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="group bg-black rounded-3xl overflow-hidden cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex justify-between">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-emerald-400 font-medium">{product.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}