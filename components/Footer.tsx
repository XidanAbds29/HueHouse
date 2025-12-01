'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-stone-100 py-12 border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="font-serif text-xl font-bold text-stone-900">HueHouse</h3>
                    <p className="text-stone-500 text-sm mt-2">Curated art for soulful spaces.</p>
                </div>

                <div className="flex items-center gap-8">
                    <Link href="/about" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                        Our Story
                    </Link>
                    <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-900 transition-colors">
                        Staff Login
                    </Link>
                </div>

                <div className="text-stone-400 text-xs">
                    &copy; {new Date().getFullYear()} HueHouse. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
