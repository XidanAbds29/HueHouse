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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
                </Link>
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
                        <p className="text-slate-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm h-fit">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" /> Profile
                        </h2>
                        {profile ? (
                            <div className="space-y-2 text-slate-600">
                                <p><span className="font-medium text-slate-900">Name:</span> {profile.name}</p>
                                <p><span className="font-medium text-slate-900">Phone:</span> {profile.phone}</p>
                                <p><span className="font-medium text-slate-900">Address:</span> {profile.address}</p>
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No profile details saved yet.</p>
                        )}
                    </div>

                    {/* Orders List */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-indigo-600" /> Order History
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl text-center text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No orders found.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-slate-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'processed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-100 py-4 space-y-2">
                                        {order.items_json.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-700">{item.name}</span>
                                                <span className="font-medium">৳{item.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <p className="font-extrabold text-indigo-600">Total: ৳{order.total_amount}</p>
                                        <button
                                            onClick={() => generateInvoice(order)}
                                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                                        >
                                            <Download className="w-4 h-4" /> Invoice
                                        </button>
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
