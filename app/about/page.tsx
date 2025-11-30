'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-transparent font-sans text-stone-900 pt-32 pb-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                <Link href="/" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-12 transition-colors font-medium uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Gallery
                </Link>

                <div className="bg-white/60 backdrop-blur-md p-8 md:p-16 rounded-3xl border border-stone-100 shadow-sm">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif font-bold mb-10 leading-tight text-3d text-stone-900"
                    >
                        We believe art is <br />
                        <span className="italic text-stone-600">the soul of a home.</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="space-y-8 text-xl text-stone-700 leading-relaxed font-light"
                    >
                        <p>
                            Welcome to <strong className="font-serif text-stone-900">HueHouse</strong>. We are not just a store; we are a curated space for those who seek to bring emotion, color, and life into their living spaces.
                        </p>
                        <p>
                            Our journey began with a simple idea: that every wall deserves a story. We collaborate with talented artists to bring you exclusive, high-quality prints and original paintings that resonate with the modern soul.
                        </p>
                        <p>
                            Whether you are looking for a bold statement piece or a subtle touch of elegance, HueHouse is your destination for artistic discovery.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-16 pt-16 border-t border-stone-200/60 flex flex-col md:flex-row justify-between gap-8"
                    >
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-4 text-stone-900">Visit Us</h2>
                            <p className="text-stone-500 leading-relaxed">
                                House 12, Road 5<br />
                                Dhanmondi, Dhaka<br />
                                Bangladesh
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-4 text-stone-900">Contact</h2>
                            <p className="text-stone-500 leading-relaxed">
                                hello@huehouse.com<br />
                                +880 1700 000000
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-4 text-stone-900">Hours</h2>
                            <p className="text-stone-500 leading-relaxed">
                                Open Daily<br />
                                10:00 AM - 8:00 PM
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
