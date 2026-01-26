import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, ArrowRight, Loader2, Check } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        artist_name: '',
        phone_number: '',
        email: '',
        password: '',
        confirm_password: '',
        username: '',
        is_label: false,
        is_artist: true,
        label_name: '',
    });
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        if (!termsAgreed) {
            setError('You must agree to the terms and conditions');
            return;
        }

        setIsLoading(true);
        try {
            // Use email as username since it's not explicitly asked for but required by Django
            const dataToSend = {
                ...formData,
                username: formData.email,
            };
            await register(dataToSend);
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                // Handle DRF validation errors which return an object of arrays
                const errorData = err.response.data;
                if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                    // Join all error messages into a single string or list
                    const messages = Object.entries(errorData).map(([key, value]) => {
                        const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                        return `${fieldName}: ${Array.isArray(value) ? value.join(' ') : value}`;
                    }).join('\n');
                    setError(messages || 'Registration failed. Please check your inputs.');
                } else {
                    setError(errorData.detail || 'Registration failed. Please try again.');
                }
            } else {
                setError('Registration failed. Please check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <img src="/src/assets/logo.jpg" alt="TunePesa" className="w-40 h-auto rounded-xl object-contain mx-auto mb-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-gray-400">Join thousands of independent artists</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">I am signing up as a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_label: false, is_artist: true })}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${!formData.is_label ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <Music className="w-6 h-6 mb-2" />
                                    <span className="font-bold">Artist</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_label: true, is_artist: false })}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${formData.is_label ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <div className="w-6 h-6 mb-2 flex items-center justify-center font-bold border-2 border-current rounded-md text-xs">LB</div>
                                    <span className="font-bold">Label</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {formData.is_label ? 'Label Name' : 'Artist Name'}
                                </label>
                                <input
                                    type="text"
                                    name={formData.is_label ? 'label_name' : 'artist_name'}
                                    value={formData.is_label ? formData.label_name : formData.artist_name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAgreed}
                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                className="w-5 h-5 bg-slate-800 border-slate-700 rounded text-primary focus:ring-primary/50"
                            />
                            <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
