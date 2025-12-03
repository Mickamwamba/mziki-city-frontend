import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, Loader2, CheckCircle, Music, Disc, ArrowRight, ArrowLeft, Info, Users, Copyright, Settings } from 'lucide-react';

const Upload = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [managedArtists, setManagedArtists] = useState([]);

    const [formData, setFormData] = useState({
        // Release Info
        title: '',
        version: '',
        language: 'English',
        explicit_content: 'not_explicit',
        genre: '',
        subgenre: '',
        catalog_number: '',
        label_name: '',
        album: '', // Optional album link
        artist_id: '', // For labels

        // Credits
        primary_artist_name: '',
        featured_artists: '',
        producer: '',
        song_writer: '',

        // Rights
        composition_owner: '',
        composition_year: new Date().getFullYear(),
        master_recording_owner: '',
        master_recording_year: new Date().getFullYear(),

        // Assets
        audio_file: null,
        cover_art: null,

        // Settings
        release_date: '',
        excluded_countries: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const albumsRes = await api.get('music/albums/');
            setAlbums(albumsRes.data);

            if (user?.is_label) {
                const artistsRes = await api.get('users/managed-artists/');
                setManagedArtists(artistsRes.data);
            }

            // Parse Query Params
            const editMode = searchParams.get('edit') === 'true';
            const id = searchParams.get('id');
            const albumId = searchParams.get('album_id');

            if (editMode && id) {
                const songRes = await api.get(`music/songs/${id}/`);
                const song = songRes.data;
                setFormData({
                    title: song.title,
                    version: song.version || '',
                    language: song.language || 'English',
                    explicit_content: song.explicit_content || 'not_explicit',
                    genre: song.genre || '',
                    subgenre: song.subgenre || '',
                    catalog_number: song.catalog_number || '',
                    label_name: song.label_name || '',
                    album: song.album || '',
                    artist_id: song.artist || '',
                    primary_artist_name: song.primary_artist_name || '',
                    featured_artists: song.featured_artists || '',
                    producer: song.producer || '',
                    song_writer: song.song_writer || '',
                    composition_owner: song.composition_owner || '',
                    composition_year: song.composition_year || new Date().getFullYear(),
                    master_recording_owner: song.master_recording_owner || '',
                    master_recording_year: song.master_recording_year || new Date().getFullYear(),
                    release_date: song.release_date || '',
                    excluded_countries: song.excluded_countries || '',
                    audio_file: null, // Don't pre-fill file inputs
                    cover_art: null,
                });
            } else if (albumId) {
                setFormData(prev => ({ ...prev, album: albumId }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const songData = new FormData();
            // Append all fields
            Object.keys(formData).forEach(key => {
                // Append if not null. We want to send empty strings to clear fields or set them to empty.
                if (formData[key] !== null) {
                    songData.append(key, formData[key]);
                }
            });

            const editMode = searchParams.get('edit') === 'true';
            const id = searchParams.get('id');

            if (editMode && id) {
                await api.patch(`music/songs/${id}/`, songData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Explicitly set is_released to False (default, but good to be explicit)
                songData.append('is_released', 'false');
                await api.post('music/songs/', songData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Redirect to My Music (Unreleased tab ideally)
            navigate('/my-music');
        } catch (error) {
            console.error('Upload/Update failed:', error);
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response.data)
                : error.message;
            alert(`Operation failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'Info', icon: Info },
        { id: 2, label: 'Credits', icon: Users },
        { id: 3, label: 'Rights', icon: Copyright },
        { id: 4, label: 'Assets', icon: Music },
        { id: 5, label: 'Settings', icon: Settings },
        { id: 6, label: 'Review', icon: CheckCircle },
    ];

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Song Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.is_label && (
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Artist *</label>
                        <select
                            name="artist_id"
                            value={formData.artist_id}
                            onChange={handleChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
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
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Song Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Summer Vibes" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Version</label>
                    <input type="text" name="version" value={formData.version} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Radio Edit, Remix" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Language *</label>
                    <input type="text" name="language" value={formData.language} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Explicit Content *</label>
                    <select name="explicit_content" value={formData.explicit_content} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white">
                        <option value="not_explicit">Not Explicit</option>
                        <option value="explicit">Explicit</option>
                        <option value="clean">Clean</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Primary Genre *</label>
                    <input type="text" name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Pop" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Subgenre</label>
                    <input type="text" name="subgenre" value={formData.subgenre} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Synth-Pop" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Catalog Number</label>
                    <input type="text" name="catalog_number" value={formData.catalog_number} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Album (Optional)</label>
                    <select name="album" value={formData.album} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white">
                        <option value="">Select an album...</option>
                        {albums.map(album => (
                            <option key={album.id} value={album.id}>{album.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Credits</h2>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Artist *</label>
                <input type="text" name="primary_artist_name" value={formData.primary_artist_name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="Main artist name" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Featured Artists</label>
                <input type="text" name="featured_artists" value={formData.featured_artists} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="Comma separated (e.g. Artist A, Artist B)" />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Rights & Production</h2>

            {/* Production Credits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-800">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Producer</label>
                    <input type="text" name="producer" value={formData.producer} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Producer Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Song Writer</label>
                    <input type="text" name="song_writer" value={formData.song_writer} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. Writer Name" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Record Label</label>
                    <input type="text" name="label_name" value={formData.label_name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. My Record Label" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">Copyright</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Composition Owner *</label>
                    <input type="text" name="composition_owner" value={formData.composition_owner} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Year *</label>
                    <input type="number" name="composition_year" value={formData.composition_year} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Master Recording Owner *</label>
                    <input type="text" name="master_recording_owner" value={formData.master_recording_owner} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Year *</label>
                    <input type="number" name="master_recording_year" value={formData.master_recording_year} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" required />
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Assets</h2>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Audio File *</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative">
                    <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio_file')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <Music className="w-8 h-8 text-primary mb-2" />
                        {formData.audio_file ? (
                            <span className="text-green-400 font-medium">{formData.audio_file.name}</span>
                        ) : (
                            <span className="text-gray-400">Upload MP3/WAV/FLAC</span>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Cover Art</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover_art')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <Disc className="w-8 h-8 text-primary mb-2" />
                        {formData.cover_art ? (
                            <span className="text-green-400 font-medium">{formData.cover_art.name}</span>
                        ) : (
                            <span className="text-gray-400">Upload JPG/PNG (3000x3000px)</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Release Settings</h2>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Release Date</label>
                <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                <p className="text-xs text-gray-500 mt-1">Leave blank for "As soon as possible"</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Excluded Countries</label>
                <input type="text" name="excluded_countries" value={formData.excluded_countries} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="e.g. US, CA (Comma separated codes)" />
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Review & Save</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-gray-400">Title:</span> <span className="text-white ml-2">{formData.title}</span></div>
                    <div><span className="text-gray-400">Artist:</span> <span className="text-white ml-2">{formData.primary_artist_name}</span></div>
                    <div><span className="text-gray-400">Genre:</span> <span className="text-white ml-2">{formData.genre}</span></div>
                    <div><span className="text-gray-400">Label:</span> <span className="text-white ml-2">{formData.label_name || '-'}</span></div>
                    <div><span className="text-gray-400">Release Date:</span> <span className="text-white ml-2">{formData.release_date || 'ASAP'}</span></div>
                </div>
                <div className="border-t border-slate-800 pt-4">
                    <p className="text-gray-400 mb-2">Assets:</p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-green-400"><Music className="w-4 h-4" /> <span>{formData.audio_file?.name}</span></div>
                        {formData.cover_art && <div className="flex items-center space-x-2 text-green-400"><Disc className="w-4 h-4" /> <span>{formData.cover_art.name}</span></div>}
                    </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                    <p className="text-blue-400 text-sm">
                        This song will be saved to your library as <strong>Unreleased</strong>. You can release it later from the "New Release" page or your "My Music" dashboard.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {searchParams.get('edit') === 'true' ? 'Edit Song' : 'Upload Music'}
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
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}

                <div className="flex justify-between mt-8 pt-8 border-t border-slate-800">
                    <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {step < steps.length ? (
                        <button onClick={() => setStep(s => Math.min(steps.length, s + 1))} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                            <span>Next</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5" />}
                            <span>{loading ? 'Saving...' : 'Save to Library'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Upload;
