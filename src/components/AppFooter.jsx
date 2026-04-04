import { Link } from 'react-router-dom';
import { Github, Linkedin, Globe, Mail } from 'lucide-react';

const AppFooter = () => {
    const year = new Date().getFullYear();
    
    return (
        <footer className="bg-white border-t border-gray-100 py-6 px-6 mt-auto">
            <div className="max-w-1100 mx-auto">
                <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                    {/* Left: Brand */}
                    <div className="flex flex-col">
                        <span className="font-playfair text-krishi-600 font-semibold text-lg">KrishiAI</span>
                        <span className="text-xs text-gray-400">Smart Farming with AI</span>
                        {/* Social Links */}
                        <div className="flex gap-2 mt-3">
                            <a 
                                href="https://github.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-krishi-50 border border-krishi-100 flex items-center justify-center text-krishi-600 hover:bg-krishi-600 hover:text-white transition-all"
                            >
                                <Github size={14} />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-krishi-50 border border-krishi-100 flex items-center justify-center text-krishi-600 hover:bg-krishi-600 hover:text-white transition-all"
                            >
                                <Linkedin size={14} />
                            </a>
                            <a 
                                href="/" 
                                className="w-8 h-8 rounded-full bg-krishi-50 border border-krishi-100 flex items-center justify-center text-krishi-600 hover:bg-krishi-600 hover:text-white transition-all"
                            >
                                <Globe size={14} />
                            </a>
                            <a 
                                href="mailto:support@krishiai.in" 
                                className="w-8 h-8 rounded-full bg-krishi-50 border border-krishi-100 flex items-center justify-center text-krishi-600 hover:bg-krishi-600 hover:text-white transition-all"
                            >
                                <Mail size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className="flex gap-6 flex-wrap">
                        <Link 
                            to="/dashboard" 
                            className="text-sm text-gray-500 hover:text-krishi-600 transition-colors font-nunito"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/detection" 
                            className="text-sm text-gray-500 hover:text-krishi-600 transition-colors font-nunito"
                        >
                            Detection
                        </Link>
                        <Link 
                            to="/inventory" 
                            className="text-sm text-gray-500 hover:text-krishi-600 transition-colors font-nunito"
                        >
                            Inventory
                        </Link>
                        <Link 
                            to="/profile" 
                            className="text-sm text-gray-500 hover:text-krishi-600 transition-colors font-nunito"
                        >
                            Profile
                        </Link>
                    </nav>

                    {/* Right: Copyright */}
                    <div className="text-xs text-gray-400">
                        Made with love for Indian Farmers © {year}
                    </div>
                </div>
                
                {/* Credit Line */}
                <p className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                    Crafted with passion by <span className="text-krishi-600 font-semibold">Jatin</span> & <span className="text-krishi-600 font-semibold">Jitendra</span>
                </p>
            </div>
        </footer>
    );
};

export default AppFooter;
