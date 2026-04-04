import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Github, Linkedin, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LandingFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#06090a] border-t border-white/8 pt-16 pb-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-lg shadow-green-500/10 flex items-center justify-center">
                <img src="/logo.png" className="w-full h-full object-contain" alt="logo" />
              </div>
              <h3 className="font-playfair text-2xl text-white">Krishi<span className="text-green-400">AI</span></h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t('footer.sub')}</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.desc')}
            </p>
            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-krishi-400 hover:border-krishi-400/30 transition-all"
              >
                <Github size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-krishi-400 hover:border-krishi-400/30 transition-all"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-krishi-400 hover:border-krishi-400/30 transition-all"
              >
                <Globe size={14} />
              </a>
              <a
                href="mailto:support@krishiai.in"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-krishi-400 hover:border-krishi-400/30 transition-all"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('common.home')}</Link>
              <Link to="/dashboard" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('nav.dashboard')}</Link>
              <Link to="/detection" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('nav.detection')}</Link>
              <Link to="/inventory" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('nav.inventory')}</Link>
            </div>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('nav.about')}</Link>
              <Link to="/team" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('nav.team') || 'Team'}</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('footer.contact')}</Link>
              <Link to="/privacy" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('privacy.title')}</Link>
              <Link to="/terms" className="block text-gray-400 hover:text-krishi-400 text-sm transition-colors">{t('terms.title')}</Link>
            </div>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <Mail className="w-4 h-4 text-krishi-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">support@krishiai.in</span>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-krishi-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">Bhopal, Madhya Pradesh, India</span>
              </div>
              <div className="flex gap-2 items-start">
                <Phone className="w-4 h-4 text-krishi-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-xs">© 2026 KrishiAI. {t('footer.rights')}</p>
          <p className="text-gray-500 text-xs">{t('footer.madeWithLove')}</p>
        </div>

        {/* Credit Line */}
        <p className="text-center text-xs text-gray-600 mt-2">
          "{t('footer.craftedBy')}"
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
