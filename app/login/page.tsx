'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
                </Link>

                <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setMode('signin'); setMessage(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'signin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setMessage(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-slate-500 mb-8">
                    {mode === 'signin' ? 'Sign in to access your orders.' : 'Join us to track your orders and invoices.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full pl-12 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all text-slate-900 placeholder:text-slate-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all text-slate-900 placeholder:text-slate-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'signin' ? <><LogIn className="w-5 h-5" /> Sign In</> : <><UserPlus className="w-5 h-5" /> Create Account</>)}
                    </button>
                </form>
            </div>
        </div>
    );
}
