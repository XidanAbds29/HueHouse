'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Order } from '@/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { Loader2, Trash2, Edit, Plus, RefreshCw, CheckCircle, AlertCircle, LogOut, Upload } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Product Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<Partial<Product>>({
        name: '', price: 0, category: '', image_url: '', description: '', stock_status: 'in_stock'
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        if (productsRes.data) setProducts(productsRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_session');
        window.location.reload();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setProductForm({ ...productForm, image_url: data.publicUrl });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProduct = async () => {
        if (editingProduct) {
            await supabase.from('products').update(productForm).eq('id', editingProduct.id);
        } else {
            await supabase.from('products').insert(productForm);
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: 0, category: '', image_url: '', description: '', stock_status: 'in_stock' });
        fetchData();
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Are you sure?')) {
            await supabase.from('products').delete().eq('id', id);
            fetchData();
        }
    };

    const updateOrderStatus = async (id: string, status: Order['status']) => {
        await supabase.from('orders').update({ status }).eq('id', id);
        fetchData();
    };

    const retryCourierSync = async (order: Order) => {
        try {
            const res = await fetch('/api/shipment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice: order.id,
                    recipient_name: order.customer_name,
                    recipient_phone: order.phone,
                    recipient_address: order.address,
                    cod_amount: order.total_amount
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                await supabase.from('orders').update({ courier_status: 'booked', tracking_id: data.tracking_id }).eq('id', order.id);
                fetchData();
                alert('Courier synced successfully!');
            } else {
                alert('Sync failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Sync failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-gray-100'}`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-gray-100'}`}
                            >
                                Products
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>
                ) : activeTab === 'orders' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-5 font-semibold text-slate-600">Order ID</th>
                                    <th className="p-5 font-semibold text-slate-600">Customer</th>
                                    <th className="p-5 font-semibold text-slate-600">Amount</th>
                                    <th className="p-5 font-semibold text-slate-600">Status</th>
                                    <th className="p-5 font-semibold text-slate-600">Courier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-slate-900">{order.customer_name}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{order.phone}</div>
                                        </td>
                                        <td className="p-5 font-bold text-slate-900">৳{order.total_amount}</td>
                                        <td className="p-5">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 ring-1 ring-inset cursor-pointer outline-none ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                    order.status === 'processed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        'bg-red-50 text-red-700 ring-red-600/20'
                                                    }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processed">Processed</option>
                                                <option value="deleted">Deleted</option>
                                            </select>
                                        </td>
                                        <td className="p-5">
                                            {order.courier_status === 'booked' ? (
                                                <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md w-fit">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Sent ({order.tracking_id})
                                                </div>
                                            ) : order.courier_status === 'failed' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-md">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Failed
                                                    </span>
                                                    <button onClick={() => retryCourierSync(order)} className="text-xs font-bold underline text-indigo-600 hover:text-indigo-700">Retry</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 text-xs font-medium italic">Not Sent</span>
                                                    <button onClick={() => retryCourierSync(order)} className="text-xs font-bold underline text-indigo-600 hover:text-indigo-700">Send Now</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setProductForm({ name: '', price: 0, category: '', image_url: '', description: '', stock_status: 'in_stock' });
                                    setIsProductModalOpen(true);
                                }}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> Add Product
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex gap-5 hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                        <ProductImage src={product.image_url} alt={product.name} className="w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 truncate text-lg">{product.name}</h3>
                                            <p className="text-indigo-600 font-extrabold text-base mt-1">৳{product.price}</p>
                                        </div>
                                        <div className="flex gap-2 mt-4 justify-end">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setProductForm(product);
                                                    setIsProductModalOpen(true);
                                                }}
                                                className="p-2 text-slate-500 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Modal */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                                    <input
                                        placeholder="e.g. Premium T-Shirt"
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (৳)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                        <select
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white"
                                            value={productForm.stock_status}
                                            onChange={e => setProductForm({ ...productForm, stock_status: e.target.value as any })}
                                        >
                                            <option value="in_stock">In Stock</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Image</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="relative flex-1">
                                            <input
                                                placeholder="Image URL"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                                                value={productForm.image_url}
                                                onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                            />
                                        </div>
                                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Upload className="w-5 h-5 text-slate-600" />}
                                        </label>
                                    </div>
                                    {productForm.image_url && (
                                        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={productForm.image_url} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                    <textarea
                                        placeholder="Product details..."
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                        rows={3}
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsProductModalOpen(false)}
                                        className="flex-1 py-3 text-slate-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProduct}
                                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Save Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
