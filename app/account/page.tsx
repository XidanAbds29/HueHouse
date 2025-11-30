'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Package, Download, LogOut, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { generateInvoice } from '@/utils/generateInvoice';

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUser(user);
        fetchData(user.id);
    };

    const fetchData = async (userId: string) => {
        // Fetch Profile
        const { data: profile } = await supabase
            .from('customers')
            .select('*')
            .eq('id', userId)
            .single();

        setProfile(profile);

        // Fetch Orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        setOrders(orders || []);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;

    return (
        <div className="min-h-screen bg-transparent p-6 md:p-12 font-sans text-stone-900">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors font-medium uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Gallery
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-2 text-3d">My Collection</h1>
                        <p className="text-stone-500 text-lg font-light">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-stone-400 hover:text-red-600 font-medium px-6 py-3 rounded-full hover:bg-red-50 transition-all uppercase tracking-widest text-xs border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-4 h-fit">
                        <div className="bg-white/60 backdrop-blur-md p-8 border border-stone-200 shadow-sm relative overflow-hidden group rounded-3xl">
                            <div className="absolute top-0 left-0 w-1 h-full bg-stone-200 group-hover:bg-stone-800 transition-colors" />
                            <h2 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3 text-stone-800">
                                <User className="w-5 h-5" /> Profile
                            </h2>
                            {profile ? (
                                <div className="space-y-4 text-stone-600">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Name</label>
                                        <p className="font-medium text-lg text-stone-900">{profile.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Phone</label>
                                        <p className="font-medium text-lg text-stone-900">{profile.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Address</label>
                                        <p className="font-medium text-lg text-stone-900 leading-relaxed">{profile.address}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-stone-400 italic font-light">No profile details saved yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="md:col-span-8 space-y-6">
                        <h2 className="font-serif font-bold text-3xl text-stone-900 mb-6 flex items-center gap-3">
                            <Package className="w-6 h-6 text-stone-400" /> Order History
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white/40 backdrop-blur-sm p-16 text-center text-stone-400 border border-stone-100 border-dashed">
                                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-light">You haven't placed any orders yet.</p>
                                <Link href="/" className="inline-block mt-6 text-stone-900 underline underline-offset-4 hover:text-stone-600 transition-colors">
                                    Start Collecting Art
                                </Link>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white/80 backdrop-blur-md p-8 shadow-sm border border-stone-100 hover:shadow-xl hover:border-stone-300 transition-all duration-300 group relative rounded-3xl">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-serif font-bold text-xl text-stone-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                    order.status === 'processed' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-stone-500 font-medium">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <button
                                            onClick={() => generateInvoice(order)}
                                            className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors border border-stone-200 px-4 py-2 hover:bg-white"
                                        >
                                            <Download className="w-4 h-4" /> INVOICE
                                        </button>
                                    </div>

                                    <div className="border-t border-stone-100 py-6 space-y-4">
                                        {order.items_json.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-stone-300 font-serif font-bold text-lg">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <span className="font-serif text-lg text-stone-800 block group-hover/item:text-stone-600 transition-colors">{item.name}</span>
                                                        <div className="text-xs text-stone-400 uppercase tracking-widest mt-1">Quantity: {item.quantity || 1}</div>
                                                    </div>
                                                </div>
                                                <span className="font-serif font-bold text-stone-600 text-lg">৳{item.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end items-center pt-6 border-t border-stone-100">
                                        <div className="text-right">
                                            <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Total Amount</span>
                                            <p className="font-serif font-bold text-3xl text-stone-900">৳{order.total_amount}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
