import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, CheckCircle, AlertCircle, Loader2, Plus, X, ArrowRight } from 'lucide-react';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(null); // Product ID being subscribed to
    const [percentage, setPercentage] = useState(10); // Default 10%

    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, subsRes] = await Promise.all([
                api.get('investments/products/'),
                api.get('investments/subscriptions/')
            ]);
            setProducts(productsRes.data);
            setSubscriptions(subsRes.data);
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedProduct) return;
        try {
            setSubscribing(selectedProduct.id);
            await api.post('investments/subscriptions/', {
                product: selectedProduct.id,
                percentage: percentage,
                is_active: true
            });
            await fetchData();
            setSubscribing(null);
            setSelectedProduct(null); // Close modal
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Failed to subscribe.');
            setSubscribing(null);
        }
    };

    const handleUnsubscribe = async (subId) => {
        if (!confirm('Are you sure you want to unsubscribe?')) return;
        try {
            await api.delete(`investments/subscriptions/${subId}/`);
            await fetchData();
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    };

    const getSubscription = (productId) => {
        return subscriptions.find(s => s.product === productId);
    };

    const openProduct = (product) => {
        const sub = getSubscription(product.id);
        if (sub) {
            setPercentage(sub.percentage);
        } else {
            setPercentage(10);
        }
        setSelectedProduct(product);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
                <p className="text-gray-400">Browse available investment products and secure your future.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                    const sub = getSubscription(product.id);
                    const isSubscribed = !!sub;

                    return (
                        <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-colors">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                                    {product.logo ? (
                                        <img src={product.logo} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <TrendingUp className="w-8 h-8 text-green-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                    {isSubscribed && (
                                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full mt-1">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Subscribed ({sub.percentage}%)</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                                {product.description}
                            </p>

                            <button
                                onClick={() => openProduct(product)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                            >
                                <span>View Details</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                                {selectedProduct.logo ? (
                                    <img src={selectedProduct.logo} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                ) : (
                                    <TrendingUp className="w-10 h-10 text-green-500" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                                <p className="text-gray-400 text-sm">Investment Product</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none mb-8">
                            <p className="text-gray-300 leading-relaxed">
                                {selectedProduct.description}
                            </p>
                        </div>

                        {getSubscription(selectedProduct.id) ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center mb-6">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-1">Active Subscription</h3>
                                <p className="text-green-400 mb-4">
                                    You are currently investing <strong>{getSubscription(selectedProduct.id).percentage}%</strong> of your revenue into this product.
                                </p>

                                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-green-500/20">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Total Invested To Date</p>
                                    <p className="text-2xl font-bold text-white">
                                        ${getSubscription(selectedProduct.id).total_invested?.toLocaleString() || '0.00'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        handleUnsubscribe(getSubscription(selectedProduct.id).id);
                                        setSelectedProduct(null);
                                    }}
                                    className="text-red-400 hover:text-red-300 text-sm font-medium hover:underline"
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-800">
                                <label className="block text-sm font-medium text-gray-300 mb-3">How much of your revenue would you like to invest?</label>
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={percentage}
                                            onChange={(e) => setPercentage(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                            min="1" max="100"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        of every release
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing === selectedProduct.id}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-primary/25"
                                >
                                    {subscribing === selectedProduct.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    <span>Confirm Subscription</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
