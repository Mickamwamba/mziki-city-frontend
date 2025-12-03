import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, User, Mail, Phone } from 'lucide-react';
import api from '../api';

const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newArtist, setNewArtist] = useState({
        first_name: '',
        last_name: '',
        artist_name: '',
        email: '',
        phone_number: '',
        password: '',
        bio: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const response = await api.get('users/managed-artists/');
            setArtists(response.data);
        } catch (error) {
            console.error('Error fetching artists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddArtist = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('users/managed-artists/', newArtist);
            setShowAddModal(false);
            setNewArtist({
                first_name: '',
                last_name: '',
                artist_name: '',
                email: '',
                phone_number: '',
                password: '',
                bio: ''
            });
            fetchArtists();
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    const messages = Object.entries(errorData).map(([key, value]) => {
                        return `${key}: ${Array.isArray(value) ? value.join(' ') : value}`;
                    }).join('\n');
                    setError(messages);
                } else {
                    setError('Failed to create artist. Please check inputs.');
                }
            } else {
                setError('Failed to create artist. Please check connection.');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Managed Artists</h1>
                    <p className="text-gray-400">Manage your label's artist roster</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Artist</span>
                </button>
            </div>

            {/* Artists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                    <Link key={artist.id} to={`/artists/${artist.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-primary/50 transition-all group block">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-primary">
                                <User className="w-6 h-6" />
                            </div>
                            <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); /* Add menu logic later */ }}>
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{artist.artist_name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{artist.first_name} {artist.last_name}</p>

                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                                <Mail className="w-4 h-4 mr-2" />
                                {artist.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-4 h-4 mr-2" />
                                {artist.phone_number || 'No phone'}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Add Artist Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">Add New Artist</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <form onSubmit={handleAddArtist} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                    value={newArtist.first_name}
                                    onChange={(e) => setNewArtist({ ...newArtist, first_name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                    value={newArtist.last_name}
                                    onChange={(e) => setNewArtist({ ...newArtist, last_name: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Artist Name (Stage Name)"
                                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                value={newArtist.artist_name}
                                onChange={(e) => setNewArtist({ ...newArtist, artist_name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                value={newArtist.email}
                                onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                value={newArtist.phone_number}
                                onChange={(e) => setNewArtist({ ...newArtist, phone_number: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Temporary Password"
                                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                value={newArtist.password}
                                onChange={(e) => setNewArtist({ ...newArtist, password: e.target.value })}
                                required
                            />
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-colors"
                                >
                                    Create Artist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Artists;
