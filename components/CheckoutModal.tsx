'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { X, ShoppingCart, User, Phone, MapPin, Loader2, Download } from 'lucide-react';
import { generateInvoice } from '@/utils/generateInvoice';

export function CheckoutModal() {
    const { cart, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const [lastOrderWaUrl, setLastOrderWaUrl] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        bkashNumber: '',
        trxId: ''
    });

    useEffect(() => {
        if (isCheckoutOpen) {
            checkUser();
        }
    }, [isCheckoutOpen]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            const { data: profile } = await supabase
                .from('customers')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    name: profile.name || '',
                    phone: profile.phone || '',
                    address: profile.address || ''
                }));
            }
        }
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate Payment Processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
        const itemsJson = cart.map(item => ({ id: item.id, name: item.name, price: item.price }));

        // Create Order in Supabase
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                customer_name: formData.name,
                phone: formData.phone,
                address: formData.address,
                total_amount: totalAmount,
                status: 'pending',
                items_json: itemsJson,
                courier_status: 'pending',
                user_id: user?.id || null
            })
            .select()
            .single();

        if (error) {
            console.error('Order failed:', error);
            alert('Failed to place order. Please try again.');
            setLoading(false);
            return;
        }

        // Save/Update Customer Profile if logged in
        if (user) {
            await supabase.from('customers').upsert({
                id: user.id,
                name: formData.name,
                phone: formData.phone,
                address: formData.address
            });
        }

        // Trigger Steadfast API
        try {
            const res = await fetch('/api/shipment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice: order.id,
                    recipient_name: formData.name,
                    recipient_phone: formData.phone,
                    recipient_address: formData.address,
                    cod_amount: totalAmount
                })
            });

            if (!res.ok) {
                await supabase.from('orders').update({ courier_status: 'failed' }).eq('id', order.id);
            } else {
                const data = await res.json();
                if (data.status === 'success') {
                    await supabase.from('orders').update({
                        courier_status: 'booked',
                        tracking_id: data.tracking_id
                    }).eq('id', order.id);
                } else {
                    await supabase.from('orders').update({ courier_status: 'failed' }).eq('id', order.id);
                }
            }
        } catch (err) {
            console.warn('Courier sync skipped (Network/Config issue)');
            await supabase.from('orders').update({ courier_status: 'failed' }).eq('id', order.id);
        }

        // Trigger Email Notification (Non-blocking)
        try {
            fetch('/api/notify/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    customerName: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    totalAmount: totalAmount,
                    items: cart.map(item => ({ name: item.name, price: item.price }))
                })
            });
        } catch (err) {
            console.error('Email notification failed:', err);
        }

        // Track Purchase
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Purchase', { value: totalAmount, currency: 'BDT' });
        }

        // WhatsApp Notification Logic
        const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000';
        const message = `New Order #${order.id.slice(0, 8)}
Name: ${formData.name}
Phone: ${formData.phone}
Address: ${formData.address}
Total: ৳${totalAmount}
Items:
${cart.map(item => `- ${item.name}`).join('\n')}`;

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        setLastOrderWaUrl(waUrl);
        setLastOrder(order);
        setOrderSuccess(true);
        clearCart();
        setLoading(false);
    };

    if (!isCheckoutOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-xl text-slate-900">Checkout</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {orderSuccess ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Order Placed!</h3>
                            <p className="text-slate-500 mt-2 mb-8 text-lg">Thank you for your purchase.</p>

                            <a
                                href={lastOrderWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:bg-[#20bd5a] flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-100 mb-4 animate-bounce"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WhatsApp" />
                                Send Order to WhatsApp
                            </a>

                            <button
                                onClick={() => generateInvoice(lastOrder)}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 mb-4"
                            >
                                <Download className="w-5 h-5" /> Download Invoice
                            </button>

                            <button
                                onClick={() => {
                                    setOrderSuccess(false);
                                    setIsCheckoutOpen(false);
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Your cart is empty.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                            {/* Cart Summary */}
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                <div className="flex justify-between font-medium mb-2 text-slate-600">
                                    <span>Total Items:</span>
                                    <span>{cart.length}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-xl text-indigo-600">
                                    <span>Total:</span>
                                    <span>৳{cart.reduce((sum, item) => sum + item.price, 0)}</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        placeholder="Full Name"
                                        className="w-full pl-12 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        placeholder="Phone Number"
                                        className="w-full pl-12 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <textarea
                                        required
                                        placeholder="Full Address"
                                        className="w-full pl-12 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all resize-none"
                                        rows={2}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xs">Bkash</span>
                                    Payment
                                </h3>
                                <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl text-sm text-pink-800 mb-5 font-medium">
                                    Send Money to <strong className="text-lg ml-1">017XXXXXXXX</strong>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        placeholder="Bkash Number"
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium"
                                        value={formData.bkashNumber}
                                        onChange={e => setFormData({ ...formData, bkashNumber: e.target.value })}
                                    />
                                    <input
                                        required
                                        placeholder="TrxID"
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium"
                                        value={formData.trxId}
                                        onChange={e => setFormData({ ...formData, trxId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-6 h-6" /> Processing...
                                    </>
                                ) : (
                                    'Confirm Order'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
