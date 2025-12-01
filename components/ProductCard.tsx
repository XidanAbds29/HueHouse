'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    addToCart: (product: Product) => void;
    gridCols?: number;
}

export function ProductCard({ product, addToCart, gridCols = 2 }: ProductCardProps) {
    return (
        <Link href={`/product/${product.id}`} className="block h-full">
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group cursor-pointer h-full"
            >
                {/* Frame Animation Container */}
                <div className="relative p-0 bg-white shadow-xl transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-1 border-[12px] border-white h-full flex flex-col">

                    {/* Image Container */}
                    <div className="aspect-square relative overflow-hidden bg-stone-100">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="w-full h-full"
                        >
                            <ProductImage
                                src={product.images?.[0] || product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="pt-4 pb-2 px-2 text-center space-y-2 flex-grow flex flex-col justify-between">
                        <div>
                            <h3 className={`font-serif text-stone-900 leading-tight ${gridCols === 3 ? 'text-base' : 'text-xl md:text-2xl'}`}>
                                {product.name}
                            </h3>
                            <p className="text-stone-500 font-medium text-sm mt-1">৳{product.price}</p>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            className="mt-3 w-full h-[44px] flex items-center justify-center border border-stone-900 text-stone-900 font-bold uppercase tracking-widest text-xs hover:bg-stone-900 hover:text-white transition-colors"
                        >
                            Add to Collection
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
