import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Play, Calendar, BarChart2, CheckCircle, Upload, Filter, Search } from 'lucide-react';

const MyMusic = () => {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('released');
    const [managedArtists, setManagedArtists] = useState([]);
    const [selectedArtistId, setSelectedArtistId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?.is_label) {
            fetchManagedArtists();
        }
    }, [user]);

    useEffect(() => {
        fetchSongs(selectedArtistId);
    }, [selectedArtistId]);

    const fetchManagedArtists = async () => {
        try {
            const response = await api.get('users/managed-artists/');
            setManagedArtists(response.data);
        } catch (error) {
            console.error('Error fetching managed artists:', error);
        }
    };

    const fetchSongs = async (artistId = '') => {
        setLoading(true);
        try {
            let url = 'music/songs/';
            if (artistId) {
                url += `?artist_id=${artistId}`;
            }
            const response = await api.get(url);
            setSongs(response.data);
        } catch (error) {
            console.error('Error fetching songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArtistChange = (e) => {
        setSelectedArtistId(e.target.value);
    };

    const filteredSongs = songs.filter(song => {
        const matchesTab = activeTab === 'released' ? song.is_released : !song.is_released;
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Music</h1>
                    <p className="text-gray-400">Manage your catalog and releases</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search songs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary w-48 md:w-64"
                        />
                    </div>
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
                    <Link to="/upload" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Upload Music</span>
                    </Link>
                </div>
            </div>

            <div className="flex space-x-6 border-b border-slate-800 mb-8">
                <button
                    onClick={() => setActiveTab('released')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'released' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    Released
                    {activeTab === 'released' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('unreleased')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'unreleased' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    Unreleased
                    {activeTab === 'unreleased' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filteredSongs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-gray-400 mb-4">No {activeTab} songs found.</p>
                    {activeTab === 'unreleased' && (
                        <Link to="/upload" className="text-primary hover:underline">Upload your first song</Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSongs.map((song) => (
                        <Link key={song.id} to={`/songs/${song.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-primary/50 transition-all group block">
                            <div className="aspect-square bg-slate-800 rounded-xl mb-4 relative overflow-hidden">
                                {song.cover_art ? (
                                    <img src={song.cover_art} alt={song.title} className="w-full h-full object-cover" />
                                ) : song.album_details?.cover_art ? (
                                    <img src={song.album_details.cover_art} alt={song.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <Play className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform">
                                        <Play className="w-6 h-6 ml-1" />
                                    </div>
                                </div>
                                {song.is_released && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Released
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 truncate">{song.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 truncate">{song.album_details?.title || 'Single'}</p>

                            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-slate-800 pt-4">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(song.created_at).toLocaleDateString()}</span>
                                </div>
                                {!song.is_released ? (
                                    <span className="text-primary font-medium text-xs bg-primary/10 px-2 py-1 rounded">Draft</span>
                                ) : (
                                    <div className="flex items-center space-x-1">
                                        <BarChart2 className="w-4 h-4" />
                                        <span>Stats</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMusic;
