import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Target, Brain, Zap, Shield, Globe, ArrowLeft } from 'lucide-react';
import LandingFooter from '../components/LandingFooter';

const AboutPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    { name: 'Jatin', role: 'Team Lead & AI Engineer', initials: 'JT' },
    { name: 'Jitendra', role: 'Backend Engineer', initials: 'JD' },
    { name: 'Aman', role: 'Frontend Developer', initials: 'AM' },
    { name: 'Mukesh', role: 'Data Scientist', initials: 'MK' },
    { name: 'Devendra', role: 'Research & QA', initials: 'DR' }
  ];

  return (
    <div className="min-h-screen bg-[#06090a]">

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
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About <span className="text-krishi-400">KrishiAI</span>
          </motion.h1>
          <div className="w-24 h-1 bg-krishi-400 mx-auto mb-8" />
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We are on a mission to empower every Indian farmer with the power of artificial intelligence
          </motion.p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-6 md:px-16 bg-[#0e1a0f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-playfair text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  KrishiAI was born from a simple realization: Indian smallholder farmers deserve access to the same advanced technology that large agricultural corporations use. We saw firsthand how crop diseases could devastate entire harvests, leaving families in financial crisis.
                </p>
                <p>
                  Our journey began in 2024 when a team of passionate engineers and agricultural experts came together with a shared vision. We developed cutting-edge AI models specifically trained on Indian crops, capable of detecting diseases with over 93% accuracy using just a smartphone camera.
                </p>
                <p>
                  Today, KrishiAI connects thousands of farmers across India, providing not just disease detection but a complete ecosystem for modern farming. From market intelligence to community support, we're building the future of Indian agriculture—one farm at a time.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { number: '10,000+', label: 'Farmers' },
                { number: '38', label: 'Disease Classes' },
                { number: '93%+', label: 'Accuracy' },
                { number: '6', label: 'Core Features' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/4 border border-white/8 rounded-2xl p-6 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-krishi-400 mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-playfair text-4xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Meet the Team
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white/4 border border-white/8 rounded-2xl p-6 backdrop-blur-sm min-w-[200px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-krishi-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {member.initials}
                </div>
                <h3 className="text-white font-semibold text-center mb-1">{member.name}</h3>
                <p className="text-gray-400 text-sm text-center">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 md:px-16 bg-[#0a120b]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-playfair text-4xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Our Mission
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'AI for Everyone', description: 'Making advanced AI accessible to every farmer, regardless of technical expertise' },
              { title: 'Offline First', description: 'Works even in areas with poor internet connectivity, essential for rural India' },
              { title: 'Hindi First', description: 'Built with Indian languages and local contexts at the core of our design' }
            ].map((mission, index) => (
              <motion.div
                key={index}
                className="bg-white/4 border border-white/8 rounded-2xl p-8 backdrop-blur-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">{mission.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{mission.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AboutPage;
