'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2 } from 'lucide-react';

interface AdminLoginProps {
    onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .eq('password', password) // Simple plaintext check as requested
                .single();

            if (data && !error) {
                localStorage.setItem('admin_session', 'true');
                onLogin();
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Access</h2>
                <p className="text-center text-slate-500 mb-8 text-sm">Enter your credentials to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(false);
                            }}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            required
                        />
                        {error && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">Invalid email or password</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Unlock Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
