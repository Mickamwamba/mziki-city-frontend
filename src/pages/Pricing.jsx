import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Music, ArrowRight } from 'lucide-react';

const Pricing = () => {
    const features = [
        "Unlimited Releases",
        "Keep 100% of Royalties",
        "Distribute to All Major Stores",
        "Daily Trending Reports",
        "Free Barcodes & ISRC Codes",
        "Dedicated Support Team",
        "YouTube Content ID",
        "Sync Licensing Opportunities"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Navigation */}
            <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Music360</span>
                        </Link>
                        <div className="flex items-center space-x-6">
                            <Link to="/pricing" className="text-white font-medium transition-colors">Pricing</Link>
                            <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">Log In</Link>
                            <Link to="/signup" className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Simple, transparent pricing.</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to take your music career to the next level.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Single Artist Plan */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-primary/20 text-primary px-4 py-1 rounded-bl-xl font-bold text-sm">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Independent Artist</h3>
                        <p className="text-gray-400 mb-6">Perfect for solo artists starting their journey.</p>

                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-bold text-white">$15</span>
                            <span className="text-gray-400 ml-2">/ year</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                Unlimited Releases
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                Distribute to All Platforms
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                Keep 100% of Your Royalties
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                Basic Analytics
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                24/7 Support
                            </li>
                        </ul>

                        <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/25 group-hover:shadow-primary/40">
                            Get Started
                        </button>
                    </div>

                    {/* Label Plan */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-400 px-4 py-1 rounded-bl-xl font-bold text-sm">
                            For Labels
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Record Label</h3>
                        <p className="text-gray-400 mb-6">Manage multiple artists and catalogs efficiently.</p>

                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-bold text-white">$50</span>
                            <span className="text-gray-400 ml-2">/ year</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                                Up to 50 Artists
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                                Manage Artist Catalogs
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                                Unlimited Releases per Artist
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                                Advanced Analytics Dashboard
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                                Priority Support
                            </li>
                        </ul>

                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all border border-slate-700 group-hover:border-purple-500/50">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Music className="w-6 h-6 text-gray-600" />
                        <span className="text-lg font-bold text-gray-500">Music360</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} Music360. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
