import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Play, DollarSign, BarChart2, Music, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

const SongDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [song, setSong] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const songRes = await api.get(`music/songs/${id}/`);
            setSong(songRes.data);

            const [analyticsRes, splitsRes] = await Promise.all([
                api.get(`analytics/song/${id}/`),
                api.get(`distribution/splits/?song=${id}`)
            ]);
            setAnalytics(analyticsRes.data);
            setSplits(splitsRes.data);
        } catch (error) {
            console.error('Error fetching song details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`music/songs/${id}/`);
            navigate('/my-music');
        } catch (error) {
            console.error('Error deleting song:', error);
            alert('Failed to delete song.');
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-400">Loading details...</div>;
    if (!song) return <div className="text-center py-12 text-gray-400">Song not found</div>;

    return (
        <div>
            <Link to="/my-music" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Music
            </Link>

            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                        {song.cover_art ? (
                            <img src={song.cover_art} alt={song.title} className="w-full h-full object-cover" />
                        ) : song.album_details?.cover_art ? (
                            <img src={song.album_details.cover_art} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                                <Music className="w-24 h-24" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{song.title}</h1>
                            <p className="text-xl text-gray-400 mb-6">{song.album_details?.title || 'Single'}</p>
                        </div>
                        {!song.is_released && (
                            <div className="flex space-x-2">
                                <Link
                                    to={`/upload?edit=true&id=${song.id}`}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                    title="Edit Song"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                    title="Delete Song"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Audio Player */}
                    {song.audio_file && (
                        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center">
                                <Music className="w-4 h-4 mr-2" />
                                Preview Track
                            </h3>
                            <audio controls className="w-full h-10 rounded-lg" src={song.audio_file}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                    {!song.is_released && (
                        <div className="mb-8">
                            <Link
                                to={`/new-release?type=single&id=${song.id}`}
                                className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/25"
                            >
                                <Music className="w-5 h-5 mr-2" />
                                <span>Release Song</span>
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <div className="flex items-center space-x-2 text-gray-400 mb-1">
                                <Play className="w-4 h-4" />
                                <span className="text-sm font-medium">Total Streams</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{analytics?.total_streams?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <div className="flex items-center space-x-2 text-gray-400 mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-sm font-medium">Total Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-white">${analytics?.total_revenue?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Song Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div><span className="text-gray-500 block">Primary Artist</span> <span className="text-white">{song.primary_artist_name}</span></div>
                            <div><span className="text-gray-500 block">Featured Artists</span> <span className="text-white">{song.featured_artists || '-'}</span></div>
                            <div><span className="text-gray-500 block">Producer</span> <span className="text-white">{song.producer || '-'}</span></div>
                            <div><span className="text-gray-500 block">Song Writer</span> <span className="text-white">{song.song_writer || '-'}</span></div>
                            <div><span className="text-gray-500 block">Genre</span> <span className="text-white">{song.genre}</span></div>
                            <div><span className="text-gray-500 block">Subgenre</span> <span className="text-white">{song.subgenre || '-'}</span></div>
                            <div><span className="text-gray-500 block">Language</span> <span className="text-white">{song.language}</span></div>
                            <div><span className="text-gray-500 block">Explicit Content</span> <span className="text-white capitalize">{song.explicit_content?.replace('_', ' ')}</span></div>
                            <div><span className="text-gray-500 block">Label</span> <span className="text-white">{song.label_name || '-'}</span></div>
                            <div><span className="text-gray-500 block">Catalog Number</span> <span className="text-white">{song.catalog_number || '-'}</span></div>
                            <div><span className="text-gray-500 block">Composition Owner</span> <span className="text-white">{song.composition_owner} ({song.composition_year})</span></div>
                            <div><span className="text-gray-500 block">Master Owner</span> <span className="text-white">{song.master_recording_owner} ({song.master_recording_year})</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                        Streams by Platform
                    </h3>
                    <div className="space-y-4">
                        {analytics?.platform_streams?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-gray-400">{item.platform__name}</span>
                                <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(item.total / analytics.total_streams) * 100}%` }}
                                    />
                                </div>
                                <span className="text-white font-medium">{item.total.toLocaleString()}</span>
                            </div>
                        ))}
                        {(!analytics?.platform_streams || analytics.platform_streams.length === 0) && (
                            <p className="text-gray-500 text-center">No streaming data yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                        Revenue by Platform
                    </h3>
                    <div className="space-y-4">
                        {analytics?.platform_revenue?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-gray-400">{item.platform__name}</span>
                                <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${(item.total / analytics.total_revenue) * 100}%` }}
                                    />
                                </div>
                                <span className="text-white font-medium">${item.total.toFixed(2)}</span>
                            </div>
                        ))}
                        {(!analytics?.platform_revenue || analytics.platform_revenue.length === 0) && (
                            <p className="text-gray-500 text-center">No revenue data yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center space-x-4 mb-6 text-red-500">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Delete Song?</h3>
                        </div>
                        <p className="text-gray-400 mb-8">
                            Are you sure you want to delete <strong>{song.title}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                            >
                                Delete Song
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SongDetails;
