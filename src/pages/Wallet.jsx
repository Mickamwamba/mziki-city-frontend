import React, { useState, useEffect } from 'react';
import api from '../api';
import { DollarSign, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const Wallet = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState(null);

    const [showConfirmation, setShowConfirmation] = useState(false);

    // Payment Config State
    const [providers, setProviders] = useState([]);
    const [payoutMethod, setPayoutMethod] = useState(null);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [paymentType, setPaymentType] = useState('BANK');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [savingPayment, setSavingPayment] = useState(false);

    useEffect(() => {
        fetchWalletData();
        fetchPaymentConfig();
    }, []);

    const fetchPaymentConfig = async () => {
        try {
            const [providersRes, methodRes] = await Promise.all([
                api.get('analytics/payment-providers/'),
                api.get('analytics/payout-method/')
            ]);
            setProviders(providersRes.data);
            if (methodRes.data) {
                setPayoutMethod(methodRes.data);
                // Pre-fill form
                setPaymentType(methodRes.data.provider_details.type);
                setSelectedProvider(methodRes.data.provider);
                setAccountName(methodRes.data.account_name);
                setAccountNumber(methodRes.data.account_number);
            }
        } catch (error) {
            console.error('Error fetching payment config:', error);
        }
    };

    const handleSavePaymentMethod = async (e) => {
        e.preventDefault();
        setSavingPayment(true);
        try {
            const response = await api.post('analytics/payout-method/', {
                provider: selectedProvider,
                account_name: accountName,
                account_number: accountNumber
            });
            setPayoutMethod(response.data);
            setIsEditingPayment(false);
            setMessage({ type: 'success', text: 'Payment configuration saved!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save payment configuration' });
        } finally {
            setSavingPayment(false);
        }
    };

    const fetchWalletData = async () => {
        try {
            const response = await api.get('analytics/wallet/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const executeWithdrawal = async () => {
        setProcessing(true);
        setMessage(null);
        try {
            await api.post('analytics/wallet/', { amount });
            setMessage({ type: 'success', text: 'Withdrawal requested successfully!' });
            setAmount('');
            setShowConfirmation(false);
            fetchWalletData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Withdrawal failed' });
            setShowConfirmation(false);
        } finally {
            setProcessing(false);
        }
    };

    const maskNumber = (num) => {
        if (!num) return '';
        if (num.length <= 4) return '****';
        return num.slice(0, -4) + '****';
    };

    if (loading) return <div className="text-center py-12 text-gray-400">Loading wallet...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Wallet & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
                    <p className="text-gray-400 mb-2">Available Balance</p>
                    <h2 className="text-5xl font-bold text-white mb-6">${data?.balance?.toFixed(2)}</h2>
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-4">Total Earnings: ${data?.total_revenue?.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Request Payout</h3>
                    {message && (
                        <div className={`p-4 rounded-xl mb-4 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Amount to Withdraw</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="50.00"
                                    max={data?.balance}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal amount: $50.00</p>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !amount || parseFloat(amount) > data?.balance || parseFloat(amount) < 50}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {processing ? 'Processing...' : (
                                <>
                                    <span>Request Payout</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative">
                        <h3 className="text-2xl font-bold text-white mb-4">Confirm Withdrawal</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to withdraw <span className="text-white font-bold">${parseFloat(amount).toFixed(2)}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeWithdrawal}
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-12">
                <h3 className="text-xl font-bold text-white mb-6">Payment Configuration</h3>

                {/* Current Method Display */}
                {payoutMethod && !isEditingPayment && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Current Payout Method</p>
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payoutMethod.provider_details.type === 'BANK' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{payoutMethod.provider_details.name}</p>
                                    <p className="text-gray-400 text-sm">
                                        {payoutMethod.account_name} • {maskNumber(payoutMethod.account_number)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditingPayment(true)}
                            className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                            Edit
                        </button>
                    </div>
                )}

                {/* Edit Form */}
                {(!payoutMethod || isEditingPayment) && (
                    <form onSubmit={handleSavePaymentMethod} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Method Type</label>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('BANK')}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-colors border ${paymentType === 'BANK' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'}`}
                                    >
                                        Bank Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('MOBILE')}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-colors border ${paymentType === 'MOBILE' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'}`}
                                    >
                                        Mobile Money
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                                <select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    required
                                >
                                    <option value="">Select Provider</option>
                                    {providers.filter(p => p.type === paymentType).map(provider => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Account Name</label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {paymentType === 'BANK' ? 'Account Number' : 'Phone Number'}
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder={paymentType === 'BANK' ? 'e.g. 0150...' : 'e.g. +255...'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            {payoutMethod && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPayment(false)}
                                    className="text-gray-400 hover:text-white font-medium px-4 py-2"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={savingPayment}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {savingPayment ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Transaction History</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {data?.withdrawals?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions yet.</div>
                    ) : (
                        data?.withdrawals?.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {tx.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                            tx.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Withdrawal Request</p>
                                        <p className="text-sm text-gray-500">{new Date(tx.requested_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold">-${tx.amount.toFixed(2)}</p>
                                    <p className={`text-sm capitalize ${tx.status === 'approved' ? 'text-green-500' :
                                        tx.status === 'rejected' ? 'text-red-500' :
                                            'text-yellow-500'
                                        }`}>{tx.status}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
