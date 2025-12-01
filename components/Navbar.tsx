'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const { cart, setIsCheckoutOpen } = useCart();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-4 md:top-6 left-0 right-0 mx-auto max-w-[95%] md:max-w-5xl z-50"
            >
                <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-full shadow-sm px-6 md:px-8 py-3 md:py-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tighter hover:opacity-80 transition-opacity text-3d">
                        HueHouse
                    </Link>

                    {/* Right Side Actions & Links */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/about" className="text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest">
                                Our Story
                            </Link>
                            {user ? (
                                <Link href="/account" className="text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                                    Account
                                </Link>
                            ) : (
                                <Link href="/login" className="text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Cart Action */}
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            className="relative flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-stone-800 transition-all active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Cart</span>
                            {cart.length > 0 && (
                                <span className="ml-1 bg-white text-stone-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-stone-800 hover:bg-white rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-24 z-40 md:hidden"
                    >
                        <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6 flex flex-col gap-4">
                            <Link
                                href="/about"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-serif font-bold text-stone-800 py-2 border-b border-stone-100"
                            >
                                Our Story
                            </Link>
                            {user ? (
                                <Link
                                    href="/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-serif font-bold text-stone-800 py-2 border-b border-stone-100 flex items-center gap-2"
                                >
                                    My Account
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-serif font-bold text-stone-800 py-2 border-b border-stone-100"
                                >
                                    Login
                                </Link>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
