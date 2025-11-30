'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductImage } from '@/components/ui/ProductImage';
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
      <section className="relative py-32 px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-serif text-stone-900 leading-tight tracking-tight text-3d"
          >
            Curated Art for <br />
            <span className="italic text-stone-600">Soulful Spaces</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light"
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
  const [gridCols, setGridCols] = useState(2);
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
          <Link href={`/product/${product.id}`} key={product.id}>
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group cursor-pointer"
            >
              {/* Frame Animation Container */}
              <div className="relative p-2 md:p-4 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-2 border border-stone-100">
                {/* The 'Frame' Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-stone-900/10 transition-colors duration-500 m-2 pointer-events-none z-10" />

                <div className="aspect-[4/5] relative overflow-hidden bg-stone-100">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full"
                  >
                    <ProductImage src={product.images?.[0] || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </motion.div>
                </div>

                <div className="pt-4 md:pt-6 text-center space-y-1 md:space-y-2">
                  <h3 className={`font-serif text-stone-900 ${gridCols === 3 ? 'text-sm' : 'text-xl md:text-2xl'}`}>{product.name}</h3>
                  <p className="text-stone-500 font-medium text-sm">৳{product.price}</p>

                  {gridCols < 3 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="mt-2 md:mt-4 w-full py-2 md:py-3 border border-stone-900 text-stone-900 font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-stone-900 hover:text-white transition-colors"
                    >
                      Add to Collection
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Mobile Hint */}
      <div className="md:hidden text-center mt-8 text-stone-400 text-xs uppercase tracking-widest animate-pulse">
        Pinch to Zoom View
      </div>
    </div>
  );
}

