import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ArrowRight, CheckCircle, Music, Globe, Shield, Zap, Users, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const LandingPage = () => {
    const [platforms, setPlatforms] = useState([]);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        try {
            const response = await api.get('distribution/platforms/');
            setPlatforms(response.data);
        } catch (error) {
            console.error('Error fetching platforms:', error);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const features = [
        {
            icon: Shield,
            title: "Release with confidence",
            description: "We'll never take your music down. Keep earning royalties, even if you cancel. Your music is safe with us."
        },
        {
            icon: Zap,
            title: "We'll support you along the way",
            description: "Our distribution specialists are there to help, and can get your release out in as little as 2 days."
        },
        {
            icon: CheckCircle,
            title: "We'll pass along the perks",
            description: "Enjoy instant profile verification for distributing with a preferred partner of Spotify & Apple Music."
        },
        {
            icon: Users,
            title: "We'll help you make connections",
            description: "We curate industry pros that you can hire to take your career to the next level."
        }
    ];

    const faqs = [
        {
            question: "How much does it cost?",
            answer: "We offer competitive pricing plans starting from free for your first release."
        },
        {
            question: "How long does distribution take?",
            answer: "Typically, your music will be live on major platforms within 2-5 business days."
        },
        {
            question: "Do I keep 100% of my royalties?",
            answer: "Yes! With our premium plans, you keep 100% of your earnings."
        },
        {
            question: "Can I take down my music later?",
            answer: "Absolutely. You retain full ownership and control of your music at all times."
        }
    ];

    return (
        <div className="min-h-screen bg-dark text-white font-sans">
            {/* Navigation */}
            <nav className="border-b border-white/5 bg-dark/80 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <img src="/src/assets/logo.jpg" alt="TunePesa" className="h-14 w-auto rounded-lg object-contain" />
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link to="/pricing" className="text-gray-300 hover:text-white font-medium transition-colors">Pricing</Link>
                            <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">Log In</Link>
                            <Link to="/signup" className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Distribute your music <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">worldwide.</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {/* Take your music to every corner of the world, quickly and flawlessly. Take control of the entire process from start to finish. */}
                        {/* Push your music into all global markets with speed and accuracy. Hold complete oversight of the whole release cycle. */}
                        A Financial-Powered Music Distribution Platform Turning Royalties Into Wealth.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/signup" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center">
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Distributors Section */}
            <section className="py-20 bg-white/5 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 font-medium mb-12 uppercase tracking-widest text-sm">Trusted by major platforms</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center">
                        {platforms.map((platform) => (
                            <div key={platform.id} className="flex flex-col items-center space-y-4 group">
                                <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center p-5 group-hover:bg-slate-700 transition-all duration-300 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                                    {platform.logo ? (
                                        <img src={platform.logo} alt={platform.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Globe className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                                <span className="text-base text-gray-300 font-semibold group-hover:text-white transition-colors">{platform.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why distribute with us?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">We provide the tools and support you need to succeed in the modern music industry.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-black/20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-medium text-lg">{faq.question}</span>
                                    {openFaq === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img src="/src/assets/logo.jpg" alt="TunePesa" className="h-10 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                    </div>
                    <div className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} TunePesa. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
