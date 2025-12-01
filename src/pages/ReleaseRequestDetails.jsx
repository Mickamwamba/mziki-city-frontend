import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, ArrowLeft, CheckCircle, Clock, XCircle, Globe, Music, Disc, AlertTriangle } from 'lucide-react';

const ReleaseRequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [release, setRelease] = useState(null);
    const [distributions, setDistributions] = useState([]);
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const [songRes, distRes, splitsRes] = await Promise.all([
                api.get(`music/songs/${id}/`),
                api.get(`distribution/requests/?song=${id}`), // Assuming we have this endpoint or similar filtering
                api.get(`distribution/splits/?song=${id}`)
            ]);
            setRelease(songRes.data);
            setDistributions(distRes.data); // This might need adjustment if endpoint returns paginated
            setSplits(splitsRes.data);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full font-bold flex items-center space-x-2"><Clock className="w-5 h-5" /><span>Pending Review</span></div>;
            case 'approved':
                return <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full font-bold flex items-center space-x-2"><CheckCircle className="w-5 h-5" /><span>Approved</span></div>;
            case 'released':
                return <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-bold flex items-center space-x-2"><CheckCircle className="w-5 h-5" /><span>Released</span></div>;
            case 'rejected':
                return <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-bold flex items-center space-x-2"><XCircle className="w-5 h-5" /><span>Rejected</span></div>;
            default:
                return <div className="bg-gray-500/10 text-gray-500 px-4 py-2 rounded-full font-bold">Draft</div>;
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!release) return <div className="text-white text-center mt-20">Release not found</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <button onClick={() => navigate('/release-requests')} className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Requests</span>
            </button>

            {/* Header */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                            {release.cover_art ? (
                                <img src={release.cover_art} alt={release.title} className="w-full h-full object-cover" />
                            ) : (
                                <Music className="w-full h-full p-6 text-slate-600" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{release.title}</h1>
                            <div className="flex items-center space-x-3 text-gray-400">
                                <span>{release.artist_name}</span>
                                <span>•</span>
                                <span>{release.genre}</span>
                                <span>•</span>
                                <span>{new Date(release.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(release.release_status)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Platform Status */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-primary" />
                        <span>Platform Status</span>
                    </h2>
                    <div className="space-y-4">
                        {distributions.length > 0 ? (
                            distributions.map(dist => (
                                <div key={dist.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                                    <div className="flex items-center space-x-3">
                                        {/* Assuming dist.platform_details or similar is populated, otherwise just name */}
                                        <span className="font-medium text-white">{dist.platform_details?.name || `Platform #${dist.platform}`}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${dist.status === 'distributed' ? 'bg-green-500/20 text-green-500' :
                                            dist.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {dist.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No specific platform requests found.</p>
                        )}
                    </div>
                </div>

                {/* Revenue Splits */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                        <Disc className="w-5 h-5 text-green-500" />
                        <span>Revenue Splits</span>
                    </h2>
                    <div className="space-y-3">
                        {splits.map((split, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                                <div>
                                    <p className="font-medium text-white">{split.recipient}</p>
                                    <p className="text-xs text-gray-500">{split.role}</p>
                                </div>
                                <span className="font-bold text-white">{split.percentage}%</span>
                            </div>
                        ))}
                        {splits.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No splits defined.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info / Timeline could go here */}
            {release.release_status === 'rejected' && (
                <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-red-500 mb-1">Release Rejected</h3>
                        <p className="text-gray-300">Your release was rejected. Please contact support for more information or submit a new release.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReleaseRequestDetails;
