import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Disc, Plus, Calendar, CheckCircle, Clock, Filter, Search } from 'lucide-react';

const Albums = () => {
    const { user } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAlbum, setNewAlbum] = useState({ title: '', release_date: '', cover_art: null, artist_id: '' });
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
        fetchAlbums(selectedArtistId);
    }, [selectedArtistId]);

    const fetchManagedArtists = async () => {
        try {
            const response = await api.get('users/managed-artists/');
            setManagedArtists(response.data);
        } catch (error) {
            console.error('Error fetching managed artists:', error);
        }
    };

    const fetchAlbums = async (artistId = '') => {
        setLoading(true);
        try {
            let url = 'music/albums/';
            if (artistId) {
                url += `?artist_id=${artistId}`;
            }
            const response = await api.get(url);
            setAlbums(response.data);
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newAlbum.title);
            formData.append('release_date', newAlbum.release_date);
            if (newAlbum.cover_art) {
                formData.append('cover_art', newAlbum.cover_art);
            }
            if (newAlbum.artist_id) {
                formData.append('artist_id', newAlbum.artist_id);
            }

            await api.post('music/albums/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setNewAlbum({ title: '', release_date: '', cover_art: null, artist_id: '' });
            fetchAlbums(selectedArtistId);
        } catch (error) {
            console.error('Error creating album:', error);
        }
    };

    const handleArtistChange = (e) => {
        setSelectedArtistId(e.target.value);
    };

    const filteredAlbums = albums.filter(album => {
        const matchesTab = activeTab === 'released' ? album.is_released : !album.is_released;
        const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Albums & EPs</h1>
                    <p className="text-gray-400">Manage your collections</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search albums..."
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
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Album</span>
                    </button>
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
                <div className="text-center py-12 text-gray-400">Loading albums...</div>
            ) : filteredAlbums.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
                    <Disc className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No {activeTab} albums found.</p>
                    {activeTab === 'unreleased' && (
                        <button onClick={() => setShowModal(true)} className="text-primary hover:underline">Create your first album</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAlbums.map((album) => (
                        <Link key={album.id} to={`/albums/${album.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-primary/50 transition-all group block">
                            <div className="aspect-square bg-slate-800 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                                {album.cover_art ? (
                                    <img src={album.cover_art} alt={album.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Disc className="w-16 h-16 text-slate-600 group-hover:text-primary transition-colors" />
                                )}
                                {album.is_released && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Released
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 truncate">{album.title}</h3>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{album.release_date ? new Date(album.release_date).getFullYear() : 'TBA'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">{album.songs?.length || 0} songs</p>
                                {!album.is_released && (
                                    <span className="text-xs text-primary font-medium">Draft</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Album</h2>
                        <form onSubmit={handleCreateAlbum} className="space-y-4">
                            {user?.is_label && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Artist *</label>
                                    <select
                                        value={newAlbum.artist_id}
                                        onChange={(e) => setNewAlbum({ ...newAlbum, artist_id: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        required
                                    >
                                        <option value="">Select Artist...</option>
                                        {managedArtists.map(artist => (
                                            <option key={artist.id} value={artist.id}>
                                                {artist.artist_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Album Title</label>
                                <input
                                    type="text"
                                    value={newAlbum.title}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Release Date (Optional)</label>
                                <input
                                    type="date"
                                    value={newAlbum.release_date}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, release_date: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Cover Art</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewAlbum({ ...newAlbum, cover_art: e.target.files[0] })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Albums;
