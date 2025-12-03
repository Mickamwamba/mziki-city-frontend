import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, Phone, Music, Disc, Play, Calendar, CheckCircle, Search, ArrowLeft } from 'lucide-react';

const ArtistDetails = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('songs');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchArtistDetails();
    }, [id]);

    const fetchArtistDetails = async () => {
        try {
            // Fetch artist info
            // Since we don't have a direct "get single managed artist" endpoint yet, 
            // we might need to fetch all and find, or assume the backend supports detail view.
            // Let's try fetching from the list for now or assume a detail endpoint exists.
            // Given previous code, `users/managed-artists/` is a ViewSet, so it should support retrieve.
            const artistRes = await api.get(`users/managed-artists/${id}/`);
            setArtist(artistRes.data);

            // Fetch artist's songs
            const songsRes = await api.get(`music/songs/?artist_id=${id}`);
            setSongs(songsRes.data);

            // Fetch artist's albums
            const albumsRes = await api.get(`music/albums/?artist_id=${id}`);
            setAlbums(albumsRes.data);
        } catch (error) {
            console.error('Error fetching artist details:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAlbums = albums.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-12 text-gray-400">Loading artist details...</div>;
    }

    if (!artist) {
        return <div className="text-center py-12 text-gray-400">Artist not found.</div>;
    }

    return (
        <div className="space-y-8">
            <Link to="/artists" className="flex items-center text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artists
            </Link>

            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-primary shrink-0">
                    <User className="w-10 h-10" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{artist.artist_name}</h1>
                    <p className="text-gray-400 text-lg mb-4">{artist.first_name} {artist.last_name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {artist.email}
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {artist.phone_number || 'No phone'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 text-center">
                    <div className="bg-slate-800 rounded-xl p-4 min-w-[100px]">
                        <div className="text-2xl font-bold text-white">{songs.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Songs</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 min-w-[100px]">
                        <div className="text-2xl font-bold text-white">{albums.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Albums</div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-6 border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('songs')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'songs' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                        >
                            Songs
                            {activeTab === 'songs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('albums')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'albums' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                        >
                            Albums
                            {activeTab === 'albums' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                </div>

                {activeTab === 'songs' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSongs.map((song) => (
                            <div key={song.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-primary/50 transition-all group">
                                <div className="aspect-square bg-slate-800 rounded-xl mb-4 relative overflow-hidden">
                                    {song.cover_art ? (
                                        <img src={song.cover_art} alt={song.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            <Play className="w-12 h-12" />
                                        </div>
                                    )}
                                    {song.is_released && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Released
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate">{song.title}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(song.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {!song.is_released && (
                                        <span className="text-primary font-medium text-xs bg-primary/10 px-2 py-1 rounded">Draft</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredSongs.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">No songs found.</div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAlbums.map((album) => (
                            <div key={album.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-primary/50 transition-all group">
                                <div className="aspect-square bg-slate-800 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                                    {album.cover_art ? (
                                        <img src={album.cover_art} alt={album.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Disc className="w-16 h-16 text-slate-600" />
                                    )}
                                    {album.is_released && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Released
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate">{album.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">{album.songs?.length || 0} songs</p>
                                    {!album.is_released && (
                                        <span className="text-xs text-primary font-medium">Draft</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredAlbums.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">No albums found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistDetails;
