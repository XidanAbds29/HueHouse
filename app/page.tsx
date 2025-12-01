'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { ProductCard } from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock_status', 'in_stock');

    if (error) {
      console.error('Error fetching products:', error.message, error.details, error.hint);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative py-32 px-6 mb-16 bg-gradient-to-b from-[#5D4037] to-[#8D6E63] text-white overflow-hidden">
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto text-center space-y-8 z-10"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-serif text-white leading-tight tracking-tight drop-shadow-lg"
          >
            Curated Art for <br />
            <span className="italic text-stone-200">Soulful Spaces</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl text-stone-100 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Discover a collection of paintings that breathe life into your home.
            Each piece is a window to a new world, framed in elegance.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-stone-400" /></div>
        ) : (
          <PinchGrid products={products} addToCart={addToCart} />
        )}
      </main>
    </div>
  );
}

function PinchGrid({ products, addToCart }: { products: Product[], addToCart: (p: Product) => void }) {
  const [gridCols, setGridCols] = useState(1);
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      // Pinch Out (Zoom In) -> Fewer Columns
      if (dist > touchStartDist + 50) {
        if (gridCols > 1) setGridCols(prev => prev - 1);
        setTouchStartDist(dist); // Reset to prevent rapid switching
      }
      // Pinch In (Zoom Out) -> More Columns
      else if (dist < touchStartDist - 50) {
        if (gridCols < 3) setGridCols(prev => prev + 1);
        setTouchStartDist(dist);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartDist(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-[50vh]"
    >
      <motion.div
        layout
        className={`grid gap-4 md:gap-12 transition-all duration-300 ease-out ${gridCols === 1 ? 'grid-cols-1' :
          gridCols === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          } sm:grid-cols-2 lg:grid-cols-3`}
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} gridCols={gridCols} />
        ))}
      </motion.div>

      {/* Mobile Hint */}
      <div className="md:hidden text-center mt-8 text-stone-400 text-xs uppercase tracking-widest animate-pulse">
        Pinch to Zoom View
      </div>
    </div>
  );
}

