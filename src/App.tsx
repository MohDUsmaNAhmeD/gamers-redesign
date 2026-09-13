import React from 'react';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';

function App() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <ProductGrid />
      {/* More sections can be added here */}
    </div>
  );
}

export default App;