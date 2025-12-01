import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, Music, Calendar, CheckCircle, XCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const ReleaseRequests = () => {
    const navigate = useNavigate();
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            const res = await api.get('distribution/release-requests/');
            setReleases(res.data);
        } catch (error) {
            console.error('Error fetching releases:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Draft</span>;
            case 'pending':
                return <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Pending Review</span></span>;
            case 'approved':
                return <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><CheckCircle className="w-3 h-3" /><span>Approved</span></span>;
            case 'released':
                return <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><CheckCircle className="w-3 h-3" /><span>Released</span></span>;
            case 'rejected':
                return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><XCircle className="w-3 h-3" /><span>Rejected</span></span>;
            default:
                return <span className="bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Release Requests</h1>
                <button onClick={() => navigate('/new-release')} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                    New Release
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                {releases.length > 0 ? (
                    <div className="divide-y divide-slate-800">
                        {releases.map(release => {
                            // Get details from first content item (song/album)
                            const content = release.contents?.[0];
                            const details = content?.song_details || content?.album_details || {};

                            return (
                                <div
                                    key={release.id}
                                    onClick={() => navigate(`/release-requests/${release.id}`)}
                                    className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {details.cover_art ? (
                                                <img src={details.cover_art} alt={release.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Music className="w-full h-full p-4 text-slate-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{release.title}</h3>
                                            <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                                                <span>{details.genre || 'Music'}</span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(release.created_at).toLocaleDateString()}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        {getStatusBadge(release.status)}
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Release Requests</h3>
                        <p className="text-gray-400 mb-6">You haven't submitted any releases yet.</p>
                        <button onClick={() => navigate('/new-release')} className="text-primary hover:underline">
                            Create your first release
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReleaseRequests;
