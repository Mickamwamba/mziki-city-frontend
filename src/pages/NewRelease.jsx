import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Upload as UploadIcon, Loader2, CheckCircle, Music, Disc, Globe, ArrowRight, ArrowLeft, Settings, ListMusic, Plus, Trash2, AlertTriangle } from 'lucide-react';

const NewRelease = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(0); // 0 = Type Selection
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);
    const [platforms, setPlatforms] = useState([]);

    // Release State
    const [releaseType, setReleaseType] = useState(null); // 'single' | 'album'
    const [selectedItem, setSelectedItem] = useState(null); // Song or Album object
    const [albumTracks, setAlbumTracks] = useState([]);
    const [platformIds, setPlatformIds] = useState([]);
    const [splits, setSplits] = useState([
        { recipient: 'Me (Primary Artist)', role: 'Artist', percentage: 100 }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [albumsRes, songsRes, platformsRes, subsRes] = await Promise.all([
                api.get('music/albums/'),
                api.get('music/songs/'),
                api.get('distribution/platforms/'),
                api.get('investments/subscriptions/active/')
            ]);
            setAlbums(albumsRes.data);
            setSongs(songsRes.data);
            setPlatforms(platformsRes.data);
            setPlatformIds(platformsRes.data.map(p => p.id));

            // Initialize splits with subscriptions
            const activeSubs = subsRes.data;
            const subSplits = activeSubs.map(sub => ({
                recipient: sub.product_details.name,
                role: 'Investment',
                percentage: parseFloat(sub.percentage),
                isLocked: true // Optional: prevent editing investment splits?
            }));

            const totalInvested = subSplits.reduce((sum, s) => sum + s.percentage, 0);
            const artistShare = Math.max(0, 100 - totalInvested);

            setSplits([
                { recipient: 'Me (Primary Artist)', role: 'Artist', percentage: artistShare },
                ...subSplits
            ]);


            // Handle Query Params after data is fetched
            const type = searchParams.get('type');
            const id = searchParams.get('id');

            if (type === 'album' && id) {
                const album = albumsRes.data.find(a => a.id === parseInt(id));
                if (album && !album.is_released) {
                    const tracks = songsRes.data.filter(s => s.album === parseInt(id));
                    setSelectedItem(album);
                    setAlbumTracks(tracks);
                    setReleaseType('album');
                    setStep(1);
                }
            } else if (type === 'single' && id) {
                const song = songsRes.data.find(s => s.id === parseInt(id));
                if (song && !song.is_released) {
                    setSelectedItem(song);
                    setReleaseType('single');
                    setStep(1);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSelectAlbum = async (album) => {
        try {
            setLoading(true);
            const tracks = songs.filter(s => s.album === album.id);
            setSelectedItem(album);
            setAlbumTracks(tracks);
            setReleaseType('album');
            setStep(1);
        } catch (error) {
            console.error('Error selecting album:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSong = (song) => {
        setSelectedItem(song);
        setReleaseType('single');
        setStep(1);
    };

    const togglePlatform = (id) => {
        setPlatformIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (releaseType === 'single') {
                // 1. Update Song to is_released=True
                const songData = new FormData();
                songData.append('is_released', 'true');
                await api.patch(`music/songs/${selectedItem.id}/`, songData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // 1. Update Album to is_released=True
                const albumData = new FormData();
                albumData.append('is_released', 'true');
                await api.patch(`music/albums/${selectedItem.id}/`, albumData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // 2. Update all tracks
                for (const track of albumTracks) {
                    const trackData = new FormData();
                    trackData.append('is_released', 'true');
                    await api.patch(`music/songs/${track.id}/`, trackData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            // 3. Prepare Splits
            const splitsData = splits.map(s => ({
                ...s,
                song: releaseType === 'single' ? selectedItem.id : null,
                album: releaseType === 'album' ? selectedItem.id : null
            }));

            // 4. Create Release Request
            const payload = {
                platform_ids: platformIds,
                splits: splitsData
            };

            if (releaseType === 'single') {
                payload.song_id = selectedItem.id;
            } else {
                payload.album_id = selectedItem.id;
            }

            await api.post('distribution/release-requests/create_release/', payload);

            navigate('/release-requests');
        } catch (error) {
            console.error('Release failed:', error);
            alert('Release failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addSplit = () => {
        setSplits([...splits, { recipient: '', role: 'Producer', percentage: 0 }]);
    };

    const removeSplit = (index) => {
        const newSplits = [...splits];
        newSplits.splice(index, 1);
        setSplits(newSplits);
    };

    const updateSplit = (index, field, value) => {
        const newSplits = [...splits];
        newSplits[index][field] = value;
        setSplits(newSplits);
    };

    const totalPercentage = splits.reduce((sum, split) => sum + Number(split.percentage), 0);
    const getSteps = () => {
        return [
            { id: 1, label: 'Review', icon: CheckCircle },
            { id: 2, label: 'Stores', icon: Globe },
            { id: 3, label: 'Splits', icon: ListMusic },
            { id: 4, label: 'Confirm', icon: UploadIcon },
        ];
    };

    const steps = getSteps();

    const renderReviewStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Review {releaseType === 'single' ? 'Song' : 'Album'}</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                        {selectedItem?.cover_art ? (
                            <img src={selectedItem.cover_art} alt={selectedItem.title} className="w-full h-full object-cover" />
                        ) : (
                            <Disc className="w-full h-full p-6 text-slate-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{selectedItem?.title}</h3>
                        <p className="text-gray-400">
                            {releaseType === 'single' ? selectedItem?.artist_name : `${albumTracks.length} tracks`}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className="bg-slate-800 text-gray-300 text-xs px-2 py-1 rounded border border-slate-700">
                                {selectedItem?.genre || 'Genre'}
                            </span>
                            <span className="bg-slate-800 text-gray-300 text-xs px-2 py-1 rounded border border-slate-700">
                                {new Date(selectedItem?.release_date || Date.now()).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                {releaseType === 'album' && (
                    <div className="border-t border-slate-800 pt-6">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Tracklist</h4>
                        <div className="divide-y divide-slate-800">
                            {albumTracks.map((track, i) => (
                                <div key={track.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-gray-500 w-6 text-center">{i + 1}</span>
                                        <span className="text-white font-medium">{track.title}</span>
                                    </div>
                                    <span className="text-gray-500 text-sm">{track.duration || '--:--'}</span>
                                </div>
                            ))}
                            {albumTracks.length === 0 && (
                                <p className="text-center text-gray-500 py-4">No tracks in this album.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStoresStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Stores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platforms.map(platform => {
                    const isSelected = platformIds.includes(platform.id);
                    return (
                        <div key={platform.id} onClick={() => togglePlatform(platform.id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${isSelected ? 'bg-primary/10 border-primary text-white' : 'bg-slate-900 border-slate-800 text-gray-400 hover:border-slate-700'}`}>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden ${isSelected ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                                {platform.logo ? (
                                    <img src={platform.logo} alt={platform.name} className="w-full h-full object-cover" />
                                ) : isSelected ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                    <Globe className="w-4 h-4 text-gray-500" />
                                )}
                            </div>
                            <span className="font-medium">{platform.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderSplitsStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Revenue Splits</h2>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    Total: {totalPercentage}%
                </div>
            </div>

            <div className="space-y-4">
                {splits.map((split, index) => (
                    <div key={index} className={`bg-slate-900 border ${split.isLocked ? 'border-primary/50 bg-primary/5' : 'border-slate-800'} p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center relative`}>
                        {split.isLocked && (
                            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                                <span>Locked (Subscription)</span>
                            </div>
                        )}
                        <div className="flex-1 w-full">
                            <label className="block text-xs text-gray-500 mb-1">Recipient</label>
                            <input
                                type="text"
                                value={split.recipient}
                                onChange={(e) => updateSplit(index, 'recipient', e.target.value)}
                                className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm ${split.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="Name or Email"
                                disabled={split.isLocked}
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs text-gray-500 mb-1">Role</label>
                            {split.isLocked ? (
                                <input
                                    type="text"
                                    value={split.role}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm opacity-50 cursor-not-allowed"
                                    disabled
                                />
                            ) : (
                                <select
                                    value={split.role}
                                    onChange={(e) => updateSplit(index, 'role', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                    <option value="Artist">Artist</option>
                                    <option value="Label">Label</option>
                                    <option value="Producer">Producer</option>
                                    <option value="Songwriter">Songwriter</option>
                                    <option value="Other">Other</option>
                                </select>
                            )}
                        </div>
                        <div className="w-full md:w-24">
                            <label className="block text-xs text-gray-500 mb-1">Share %</label>
                            <input
                                type="number"
                                value={split.percentage}
                                onChange={(e) => updateSplit(index, 'percentage', e.target.value)}
                                className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm ${split.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                min="0" max="100"
                                disabled={split.isLocked}
                            />
                        </div>
                        {splits.length > 1 && !split.isLocked && (
                            <button onClick={() => removeSplit(index)} className="text-red-500 hover:text-red-400 p-2 mt-4 md:mt-0">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={addSplit} className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Recipient</span>
            </button>

            {totalPercentage !== 100 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3 text-red-500 text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Total percentage must equal 100%. Current total: {totalPercentage}%</span>
                </div>
            )}
        </div>
    );

    const renderConfirmStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Ready to Submit?</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Release to {platformIds.length} Stores</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Your release <strong>{selectedItem?.title}</strong> will be submitted for review. Once approved, it will be sent to Spotify, Apple Music, and other selected stores.
                </p>
                <div className="flex justify-center">
                    <button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-12 py-4 rounded-xl font-bold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5" />}
                        <span>{loading ? 'Processing...' : 'Confirm Release Request'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // --- Step 0: Selection ---
    if (step === 0) {
        const unreleasedSongs = songs.filter(s => !s.is_released && !s.album); // Only singles (no album assigned)
        const unreleasedAlbums = albums.filter(a => !a.is_released);

        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">New Release</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Single Selection */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Music className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Single Song</h2>
                                <p className="text-gray-400 text-sm">Release a single track</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {unreleasedSongs.length > 0 ? (
                                unreleasedSongs.map(song => (
                                    <div
                                        key={song.id}
                                        onClick={() => handleSelectSong(song)}
                                        className="bg-slate-900 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-primary transition-colors flex items-center space-x-3"
                                    >
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {song.cover_art ? <img src={song.cover_art} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 text-slate-600" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">{song.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{new Date(song.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="mb-2">No unreleased singles.</p>
                                    <button onClick={() => navigate('/upload')} className="text-primary text-sm hover:underline">Upload a song</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Album Selection */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <Disc className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Album / EP</h2>
                                <p className="text-gray-400 text-sm">Release a collection</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {unreleasedAlbums.length > 0 ? (
                                unreleasedAlbums.map(album => (
                                    <div
                                        key={album.id}
                                        onClick={() => handleSelectAlbum(album)}
                                        className="bg-slate-900 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-primary transition-colors flex items-center space-x-3"
                                    >
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {album.cover_art ? <img src={album.cover_art} className="w-full h-full object-cover" /> : <Disc className="w-full h-full p-2 text-slate-600" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">{album.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{album.songs?.length || 0} tracks</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="mb-2">No unreleased albums.</p>
                                    <button onClick={() => navigate('/albums')} className="text-primary text-sm hover:underline">Create an album</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Release: {selectedItem?.title}
                </h1>
                <div className="flex items-center space-x-2 overflow-x-auto pb-4">
                    {steps.map((s, i) => (
                        <div key={s.id} className={`flex items-center flex-shrink-0 ${step === s.id ? 'text-primary' : step > s.id ? 'text-green-500' : 'text-gray-600'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border mr-2 ${step === s.id ? 'border-primary bg-primary/10' : step > s.id ? 'border-green-500 bg-green-500/10' : 'border-gray-700 bg-slate-800'}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium mr-4">{s.label}</span>
                            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-gray-700 mr-4" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                {step === 1 && renderReviewStep()}
                {step === 2 && renderStoresStep()}
                {step === 3 && renderSplitsStep()}
                {step === 4 && renderConfirmStep()}

                <div className="flex justify-between mt-8 pt-8 border-t border-slate-800">
                    <button onClick={() => setStep(s => Math.max(0, s - 1))} className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors text-gray-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {step < steps.length && (
                        <button
                            onClick={() => setStep(s => Math.min(steps.length, s + 1))}
                            disabled={step === 3 && totalPercentage !== 100}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewRelease;
