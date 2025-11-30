'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
    }, [resolvedParams.id]);

    const fetchProduct = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', resolvedParams.id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
        } else {
            setProduct(data);
            // Initialize active image with the first image in the array or the legacy image_url
            const initialImage = (data.images && data.images.length > 0) ? data.images[0] : data.image_url;
            setActiveImage(initialImage);
        }
        setLoading(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-stone-400" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-stone-500">Product not found.</div>;

    return (
        <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 font-sans text-stone-900">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-12 transition-colors font-medium uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Gallery
                </Link>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Left: Image */}
                    {/* Left: Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <div className="relative bg-white/60 backdrop-blur-sm p-4 md:p-8 shadow-sm border border-stone-100">
                            <div className="aspect-[4/5] relative overflow-hidden bg-stone-100">
                                <ProductImage src={activeImage || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 border-2 transition-all ${activeImage === img ? 'border-stone-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <ProductImage src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="space-y-8 sticky top-32"
                    >
                        <div>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-4 leading-tight">{product.name}</h1>
                            <p className="text-3xl text-stone-600 font-serif italic">৳{product.price}</p>
                        </div>

                        <div className="prose prose-stone prose-lg text-stone-600 leading-relaxed font-light">
                            <p>{product.description}</p>
                        </div>

                        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-stone-900 text-white py-4 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="w-5 h-5" /> Add to Collection
                            </button>

                            <a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000'}?text=Hi, I want to buy ${product.name} - ${product.price}Tk`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#25D366] text-white py-4 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#20bd5a] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WhatsApp" />
                                Order via WhatsApp
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
