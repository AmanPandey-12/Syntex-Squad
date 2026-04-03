import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';

const TermsPage = () => {
  const navigate = useNavigate();
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using KrishiAI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
        'These terms constitute a legally binding agreement between you and KrishiAI regarding your use of our agricultural AI platform.'
      ]
    },
    {
      title: 'Use of Service',
      content: [
        'KrishiAI is designed exclusively for agricultural purposes. Farmers, agricultural researchers, and farming communities may use our platform for crop disease detection, market intelligence, and farming insights.',
        'You agree not to misuse our service, including reverse engineering our AI models, scraping data, or using the platform for non-agricultural commercial purposes.'
      ]
    },
    {
      title: 'AI Disclaimer',
      content: [
        'Our AI disease detection provides advisory information only. While we strive for high accuracy, AI predictions should not replace professional agricultural expertise.',
        'Always consult with qualified agricultural experts or extension officers for critical farming decisions, especially those affecting crop yields and livelihood.'
      ]
    },
    {
      title: 'User Accounts',
      content: [
        'You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.',
        'Notify us immediately of any unauthorized use. We are not liable for losses resulting from unauthorized account access.'
      ]
    },
    {
      title: 'Intellectual Property',
      content: [
        'KrishiAI owns all intellectual property rights to the platform, AI models, and proprietary technology. You retain ownership of your farming data and crop information.',
        'You may not copy, modify, distribute, or create derivative works of our service without explicit written permission.'
      ]
    },
    {
      title: 'Limitation of Liability',
      content: [
        'KrishiAI is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from your use of our service.',
        'Our total liability shall not exceed the amount you paid for our service in the twelve months preceding the claim.'
      ]
    },
    {
      title: 'Changes to Terms',
      content: [
        'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.',
        'Continued use of our service after changes constitutes acceptance of the modified terms.'
      ]
    },
    {
      title: 'Contact',
      content: [
        'For questions about these Terms of Service, contact our legal team at support@krishiai.in.',
        'We welcome feedback and suggestions for improving our terms and service.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#06090a]">
      <Navbar dark={true} />
      
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-all duration-200 text-xs sm:text-sm font-medium group"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-krishi-400/60 group-hover:text-krishi-400 transition-all duration-200 group-hover:scale-105 backdrop-blur-sm">
            <ArrowLeft size={14} className="sm:size-16" />
          </span>
          <span className="hidden sm:inline">Go Back</span>
          <span className="sm:hidden">← Back</span>
        </button>
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Terms of <span className="text-krishi-400">Service</span>
          </motion.h1>
          <div className="w-24 h-1 bg-krishi-400 mx-auto mb-8" />
          <motion.p 
            className="text-lg text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Effective: January 2026
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
            These terms ensure a fair, transparent, and mutually beneficial relationship 
            between KrishiAI and our valued farming community.
          </motion.p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TermsPage;
