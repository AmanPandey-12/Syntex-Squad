import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'We collect minimal information necessary to provide our agricultural AI services. This includes your email address for account management, basic profile information (name, location, crops grown), and crop scan images for disease analysis.',
        'All data collection is transparent and you have full control over what information you share with us.'
      ]
    },
    {
      title: 'How We Use Your Data',
      content: [
        'Your data is used exclusively for improving your farming experience. We analyze crop images to detect diseases, provide personalized recommendations, and enhance our AI models.',
        'We never sell your data to third parties. Your information is only used to provide better agricultural insights and improve our service quality.'
      ]
    },
    {
      title: 'Data Storage',
      content: [
        'All data is stored securely on Firebase/Firestore with enterprise-grade encryption. Our servers are India-based to ensure fast access and compliance with local regulations.',
        'Regular backups and security audits ensure your agricultural data remains safe and accessible whenever you need it.'
      ]
    },
    {
      title: 'Image Privacy',
      content: [
        'Leaf scan images are processed by our AI models for disease detection and are not stored permanently unless you explicitly save them to your crop inventory.',
        'Images are used solely for agricultural analysis and are never shared with external parties without your explicit consent.'
      ]
    },
    {
      title: 'Your Rights',
      content: [
        'You have complete control over your data. Access, download, or delete your information anytime from your Profile page.',
        'Request data exports, account deletion, or modifications to your stored information - all processed within 30 days of request.'
      ]
    },
    {
      title: 'Contact Us',
      content: [
        'For any privacy concerns or data-related questions, reach out to our dedicated privacy team at support@krishiai.in.',
        'We respond to all privacy inquiries within 48 hours and take all concerns seriously.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#06090a]">
      <Navbar dark={true} />
      
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-all duration-200 text-xs sm:text-sm font-medium group"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-krishi-400/60 group-hover:text-krishi-400 transition-all duration-200 group-hover:scale-105 backdrop-blur-sm">
            <ArrowLeft size={14} className="sm:size-16" />
          </span>
          <span className="hidden sm:inline">{t('common.goBack')}</span>
          <span className="sm:hidden">← {t('common.back')}</span>
        </button>
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('privacy.title')}
          </motion.h1>
          <div className="w-24 h-1 bg-krishi-400 mx-auto mb-8" />
          <motion.p 
            className="text-lg text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Last updated: January 2026
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-6 md:px-16 bg-[#0e1a0f]">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="bg-white/4 border border-white/8 rounded-2xl p-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-lg font-semibold text-krishi-400 mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-300 text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p 
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            This privacy policy is part of our commitment to transparency and user trust. 
            We review and update it regularly to reflect our evolving practices.
          </motion.p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
