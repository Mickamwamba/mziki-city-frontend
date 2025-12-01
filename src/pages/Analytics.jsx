import React, { useState, useEffect } from 'react';
import api from '../api';
import { DollarSign, PlayCircle, TrendingUp } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('analytics/dashboard/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Performance</h1>
                <p className="text-gray-400">Track your streams and revenue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Total Revenue</h3>
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">${data?.total_revenue?.toFixed(2) || '0.00'}</p>
                    <div className="flex items-center space-x-1 text-green-500 text-sm mt-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12.5% from last month</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Total Streams</h3>
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{data?.total_streams?.toLocaleString() || '0'}</p>
                    <div className="flex items-center space-x-1 text-blue-500 text-sm mt-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>+8.2% from last month</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-slate-800">
                                <th className="pb-4 font-medium">Song</th>
                                <th className="pb-4 font-medium">Platform</th>
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium text-right">Streams</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data?.recent_streams?.map((stream, index) => (
                                <tr key={index} className="text-sm">
                                    <td className="py-4 text-white font-medium">{stream.song_title}</td>
                                    <td className="py-4 text-gray-400">{stream.platform_name}</td>
                                    <td className="py-4 text-gray-400">{stream.date}</td>
                                    <td className="py-4 text-white text-right">{stream.count.toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!data?.recent_streams || data.recent_streams.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500">No recent activity found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
