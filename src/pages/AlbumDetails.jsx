import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Disc, Calendar, Music, ArrowLeft, Upload, Rocket, Edit, Trash2, AlertTriangle, X, Save } from 'lucide-react';

const AlbumDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [songs, setSongs] = useState([]);
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        title: '',
        genre: '',
        release_date: '',
        upc: '',
        label_name: ''
    });

    useEffect(() => {
        fetchAlbumDetails();
    }, [id]);

    const fetchAlbumDetails = async () => {
        try {
            const albumRes = await api.get(`music/albums/${id}/`);
            setAlbum(albumRes.data);
            setEditFormData({
                title: albumRes.data.title,
                genre: albumRes.data.genre || '',
                release_date: albumRes.data.release_date || '',
                upc: albumRes.data.upc || '',
                label_name: albumRes.data.label_name || ''
            });

            const songsRes = await api.get('music/songs/');
            const albumSongs = songsRes.data.filter(song => song.album === parseInt(id));
            setSongs(albumSongs);

            const splitsRes = await api.get(`distribution/splits/?album=${id}`);
            setSplits(splitsRes.data);
        } catch (error) {
            console.error('Error fetching album details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseAlbum = () => {
        navigate(`/new-release?type=album&id=${id}`);
    };

    const handleAddSong = () => {
        navigate(`/upload?type=song&album_id=${id}`);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`music/albums/${id}/`);
            navigate('/albums');
        } catch (error) {
            console.error('Error deleting album:', error);
            alert('Failed to delete album.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(editFormData).forEach(key => {
                if (editFormData[key]) formData.append(key, editFormData[key]);
            });

            const res = await api.patch(`music/albums/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAlbum(res.data);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating album:', error);
            alert('Failed to update album.');
        }
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="text-center py-12 text-gray-400">Loading album...</div>;
    if (!album) return <div className="text-center py-12 text-gray-400">Album not found</div>;

    return (
        <div>
            <Link to="/albums" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Albums
            </Link>

            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center mb-4 overflow-hidden relative">
                        {album.cover_art ? (
                            <img src={album.cover_art} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                            <Disc className="w-24 h-24 text-slate-700" />
                        )}
                        {album.is_released && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                Released
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
                            <div className="flex items-center space-x-4 text-gray-400 mb-6">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Released: {album.release_date ? new Date(album.release_date).toLocaleDateString() : 'TBA'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Music className="w-4 h-4" />
                                    <span>{songs.length} Songs</span>
                                </div>
                            </div>
                        </div>
                        {!album.is_released && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                    title="Edit Album"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                    title="Delete Album"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {!album.is_released && (
                        <div className="flex flex-wrap gap-4 mb-8">
                            <button
                                onClick={handleAddSong}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Add Song</span>
                            </button>
                            <button
                                onClick={handleReleaseAlbum}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                            >
                                <Rocket className="w-5 h-5" />
                                <span>Release Album</span>
                            </button>
                        </div>
                    )}

                    {/* Album Metadata */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Album Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div><span className="text-gray-500 block">Genre</span> <span className="text-white">{album.genre || '-'}</span></div>
                            <div><span className="text-gray-500 block">Label</span> <span className="text-white">{album.label_name || '-'}</span></div>
                            <div><span className="text-gray-500 block">UPC</span> <span className="text-white">{album.upc || '-'}</span></div>
                            <div><span className="text-gray-500 block">Release Date</span> <span className="text-white">{album.release_date || 'TBA'}</span></div>
                        </div>
                    </div>

                    {/* Revenue Splits */}
                    {splits.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Revenue Splits</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-gray-400">
                                            <th className="pb-3 font-medium">Recipient</th>
                                            <th className="pb-3 font-medium">Role</th>
                                            <th className="pb-3 font-medium text-right">Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {splits.map((split) => (
                                            <tr key={split.id}>
                                                <td className="py-3 text-white">{split.recipient}</td>
                                                <td className="py-3 text-gray-400">{split.role}</td>
                                                <td className="py-3 text-white text-right font-bold">{split.percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Tracklist</h2>
                    {!album.is_released && songs.length > 0 && (
                        <span className="text-sm text-gray-500">Add more songs before releasing</span>
                    )}
                </div>
                <div className="divide-y divide-slate-800">
                    {songs.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400 mb-4">No songs in this album yet.</p>
                            {!album.is_released && (
                                <button onClick={handleAddSong} className="text-primary hover:underline">Add your first song</button>
                            )}
                        </div>
                    ) : (
                        songs.map((song, index) => (
                            <div key={song.id} className="p-4 flex items-center hover:bg-slate-800/50 transition-colors group">
                                <span className="w-8 text-gray-500 font-medium text-center">{index + 1}</span>
                                <div className="flex-1 ml-4">
                                    <h3 className="text-white font-medium">{song.title}</h3>
                                    <p className="text-sm text-gray-500">{song.genre || 'Unknown Genre'}</p>
                                </div>
                                <div className="text-gray-400 text-sm mr-4">
                                    {song.duration || '--:--'}
                                </div>
                                {!album.is_released && (
                                    <Link
                                        to={`/upload?edit=true&id=${song.id}`}
                                        className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit Song"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
                showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
                            <div className="flex items-center space-x-4 mb-6 text-red-500">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Delete Album?</h3>
                            </div>
                            <p className="text-gray-400 mb-8">
                                Are you sure you want to delete <strong>{album.title}</strong>? This will also delete all songs in the album. This action cannot be undone.
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
                                    Delete Album
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                showEditModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Edit Album</h3>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Album Title</label>
                                    <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                                    <input type="text" name="genre" value={editFormData.genre} onChange={handleEditChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Label Name</label>
                                    <input type="text" name="label_name" value={editFormData.label_name} onChange={handleEditChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">UPC (Optional)</label>
                                    <input type="text" name="upc" value={editFormData.upc} onChange={handleEditChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Release Date</label>
                                    <input type="date" name="release_date" value={editFormData.release_date} onChange={handleEditChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 mt-4">
                                    <Save className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AlbumDetails;
