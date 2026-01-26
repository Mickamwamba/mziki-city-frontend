
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, PlayCircle, TrendingUp, Music, ArrowRight, Users, Filter } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasSongs, setHasSongs] = useState(false);
    const [managedArtists, setManagedArtists] = useState([]);
    const [selectedArtistId, setSelectedArtistId] = useState('');

    useEffect(() => {
        if (user?.is_label) {
            fetchManagedArtists();
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData(selectedArtistId);
    }, [selectedArtistId]);

    const fetchManagedArtists = async () => {
        try {
            const response = await api.get('users/managed-artists/');
            setManagedArtists(response.data);
        } catch (error) {
            console.error('Error fetching managed artists:', error);
        }
    };

    const fetchDashboardData = async (artistId = '') => {
        setLoading(true);
        try {
            let analyticsUrl = 'analytics/dashboard/';
            let songsUrl = 'music/songs/';

            if (artistId) {
                analyticsUrl += `?artist_id=${artistId}`;
                songsUrl += `?artist_id=${artistId}`;
            }

            const [analyticsRes, songsRes] = await Promise.all([
                api.get(analyticsUrl),
                api.get(songsUrl)
            ]);
            setData(analyticsRes.data);
            setHasSongs(songsRes.data.length > 0);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArtistChange = (e) => {
        setSelectedArtistId(e.target.value);
    };

    const handleExport = () => {
        if (!data) return;

        const date = new Date().toLocaleDateString();
        let csvContent = `TunePesa Analytics Report - ${date} \n\n`;

        // Section 1: Summary
        csvContent += `SUMMARY\n`;
        csvContent += `Total Streams, ${data.total_streams} \n`;
        csvContent += `Total Revenue, $${data.total_revenue.toFixed(2)} \n\n`;

        // Section 2: Streams by Platform
        csvContent += `STREAMS BY PLATFORM\n`;
        csvContent += `Platform, Streams\n`;
        data.platform_streams.forEach(item => {
            csvContent += `${item.platform__name},${item.total} \n`;
        });
        csvContent += `\n`;

        // Section 3: Revenue by Platform
        csvContent += `REVENUE BY PLATFORM\n`;
        csvContent += `Platform, Revenue\n`;
        data.platform_revenue.forEach(item => {
            csvContent += `${item.platform__name},$${item.total.toFixed(2)} \n`;
        });
        csvContent += `\n`;

        // Section 4: Recent Activity
        csvContent += `TOP PERFORMING SONGS(RECENT) \n`;
        csvContent += `Song, Platform, Date, Streams\n`;
        data.recent_streams.forEach(item => {
            csvContent += `${item.song_title},${item.platform_name},${item.date},${item.count} \n`;
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tunepesa_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !data) return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>;

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Overview of your music performance</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {user?.is_label && (
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedArtistId}
                                onChange={handleArtistChange}
                                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="">All Artists</option>
                                {managedArtists.map(artist => (
                                    <option key={artist.id} value={artist.id}>
                                        {artist.artist_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {hasSongs && (
                        <button
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 border border-slate-700"
                        >
                            <ArrowRight className="w-4 h-4 rotate-45" />
                            <span>Export Report</span>
                        </button>
                    )}
                    {!hasSongs && !user?.is_label && (
                        <Link to="/upload" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                            <Music className="w-5 h-5" />
                            <span>Upload First Song</span>
                        </Link>
                    )}
                    {!hasSongs && user?.is_label && (
                        <Link to="/upload" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                            <Music className="w-5 h-5" />
                            <span>Upload Song for Artist</span>
                        </Link>
                    )}
                </div>
            </div>

            {!hasSongs && !selectedArtistId ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Music className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Start Your Journey</h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Upload your music to Spotify, Apple Music, and 150+ other stores. Keep 100% of your earnings.
                    </p>
                    <Link to="/upload" className="inline-flex items-center space-x-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                        <span>Distribute Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <>
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

                    {/* Platform Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Streams by Platform */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <PlayCircle className="w-5 h-5 mr-2 text-blue-500" />
                                    Streams by Platform
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {data?.platform_streams?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-400">{item.platform__name}</span>
                                        <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${(item.total / data.total_streams) * 100}% ` }}
                                            />
                                        </div>
                                        <span className="text-white font-medium">{item.total.toLocaleString()}</span>
                                    </div>
                                ))}
                                {(!data?.platform_streams || data.platform_streams.length === 0) && (
                                    <p className="text-gray-500 text-center">No streaming data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Revenue by Platform */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                                    Revenue by Platform
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {data?.platform_revenue?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-400">{item.platform__name}</span>
                                        <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${(item.total / data.total_revenue) * 100}% ` }}
                                            />
                                        </div>
                                        <span className="text-white font-medium">${item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                                {(!data?.platform_revenue || data.platform_revenue.length === 0) && (
                                    <p className="text-gray-500 text-center">No revenue data yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Top Performing Songs</h3>
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
                </>
            )}
        </div>
    );
};

export default Dashboard;
