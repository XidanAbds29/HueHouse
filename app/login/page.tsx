'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/account`,
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email to confirm your account!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/account');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/50 relative overflow-hidden"
            >
                {/* Decorative sheen */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-400/20 to-transparent" />

                <Link href="/" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors font-medium uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Store
                </Link>

                <div className="flex gap-2 mb-8 bg-stone-100/50 p-1 rounded-xl border border-stone-200/50">
                    <button
                        onClick={() => { setMode('signin'); setMessage(null); }}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setMessage(null); }}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 text-3d">
                    {mode === 'signin' ? 'Welcome Back' : 'Join HueHouse'}
                </h1>
                <p className="text-stone-500 mb-8 font-light text-lg">
                    {mode === 'signin' ? 'Sign in to access your collection.' : 'Start your art collection journey today.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full pl-12 p-3.5 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none font-medium transition-all text-stone-900 placeholder:text-stone-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 p-3.5 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none font-medium transition-all text-stone-900 placeholder:text-stone-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 disabled:opacity-70 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'signin' ? <><LogIn className="w-4 h-4" /> Sign In</> : <><UserPlus className="w-4 h-4" /> Create Account</>)}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
