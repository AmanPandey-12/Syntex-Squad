import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Instagram, Globe, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';
import { useLanguage } from '../context/LanguageContext';

const TeamPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const team = [
    {
      name: 'Jatin Dongre',
      role: 'Team Lead & AI Engineer',
      year: '3rd Year · CSE-AIML',
      college: 'Technocrats Institute of Technology, Bhopal',
      about: 'The brain behind KrishiAI\'s AI architecture — Jatin leads the team with a sharp focus on machine learning, OpenRouter integration, and making AI accessible for Indian farmers.',
      initials: 'JD',
      color: '#2e7d4f',
      linkedin: 'https://www.linkedin.com/in/jatin-dongre-6a13a3294',
      github: 'https://github.com/jatin12-alt',
      instagram: 'https://www.instagram.com/jatin.dongre.963',
      portfolio: null,
    },
    {
      name: 'Aman Pandey',
      role: 'Research & QA Analyst',
      year: '3rd Year · CSE-AIML',
      college: 'Technocrats Institute of Technology, Bhopal',
      about: 'Aman ensures every feature is grounded in real agricultural research and works flawlessly — from testing edge cases to validating AI outputs against real-world farming scenarios.',
      initials: 'AP',
      color: '#1e6ea6',
      linkedin: 'https://www.linkedin.com/in/aman-pandey-student',
      github: 'https://github.com/AmanPandey-12',
      instagram: 'https://www.instagram.com/amanpandey.1/',
      portfolio: 'https://aman-pandey01.vercel.app/',
    },
    {
      name: 'Jitendra Yadav',
      role: 'Backend & Database Engineer',
      year: '3rd Year · CSE-AIML',
      college: 'Technocrats Institute of Technology, Bhopal',
      about: 'Jitendra is the backbone of KrishiAI — architecting Firebase Firestore collections, securing data rules, and ensuring every API call reaches its destination reliably.',
      initials: 'JY',
      color: '#7c3aed',
      linkedin: 'https://www.linkedin.com/in/jitendra-yadav-014718195',
      github: 'https://github.com/jeetucodes/',
      instagram: 'https://www.instagram.com/jeetu.yada.v',
      portfolio: null,
    },
    {
      name: 'Mukesh Kumar Paswan',
      role: 'Data Science & API Integration',
      year: '3rd Year · CSE-AIML',
      college: 'Technocrats Institute of Technology, Bhopal',
      about: 'Mukesh bridges the gap between raw government data and useful farmer insights — integrating Agmarknet, data.gov.in, and weather APIs to bring real-time intelligence to the platform.',
      initials: 'MK',
      color: '#b8651a',
      linkedin: 'https://www.linkedin.com/in/mukesh-kumar-paswan-221361361/',
      github: 'https://github.com/Mukesh-kumar-Paswan/',
      instagram: null,
      portfolio: null,
    },
    {
      name: 'Devendra Dongre',
      role: 'Frontend & PWA Developer',
      year: '3rd Year · CSE-AIML',
      college: 'Technocrats Institute of Technology, Bhopal',
      about: 'Devendra crafts the pixel-perfect interfaces that farmers interact with daily — building responsive React components, PWA offline support, and smooth animations that make KrishiAI feel native.',
      initials: 'DD',
      color: '#c0392b',
      linkedin: 'https://www.linkedin.com/in/devendradongre',
      github: 'https://github.com/Devendradongre/devendradongre.git',
      instagram: 'https://www.instagram.com/devendra_0392',
      portfolio: null,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06090a; font-family: 'Nunito', sans-serif; }

        .team-page { min-height: 100vh; background: #06090a; padding-top: 20px; }
        .team-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }

        /* Back button */
        .team-back { display: inline-flex; align-items: center; gap: 10px; color: #9ca3af; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 24px; margin-bottom: 48px; transition: color .15s; background: none; border: none; }
        .team-back:hover { color: #fff; }
        .team-back-ico { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; }

        /* Hero section */
        .team-hero { text-align: center; margin-bottom: 72px; }
        .team-eyebrow { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #2e7d4f; background: rgba(46,125,79,0.12); border: 1px solid rgba(46,125,79,0.2); border-radius: 100px; padding: 5px 16px; margin-bottom: 20px; }
        .team-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 6vw, 60px); font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; }
        .team-hero-title span { color: #2e7d4f; }
        .team-hero-sub { font-size: 16px; color: #9ca3af; max-width: 520px; margin: 0 auto; line-height: 1.7; }

        /* Stats row */
        .team-stats { display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; margin-top: 40px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .team-stat-item { text-align: center; }
        .team-stat-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: #fff; }
        .team-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }

        /* Cards grid */
        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

        /* Individual card */
        .team-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; transition: all .2s; position: relative; overflow: hidden; }
        .team-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity .2s; }
        .team-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); transform: translateY(-3px); }
        .team-card:hover::before { opacity: 1; }

        /* Avatar */
        .team-avatar { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 18px; flex-shrink: 0; }

        /* Card content */
        .team-card-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .team-card-role { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 6px; }
        .team-card-year { font-size: 11px; color: #6b7280; margin-bottom: 14px; }
        .team-card-about { font-size: 13px; color: #9ca3af; line-height: 1.65; margin-bottom: 20px; }

        /* Social links */
        .team-socials { display: flex; gap: 8px; flex-wrap: wrap; }
        .team-social-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; transition: all .15s; border: 1px solid; }
        .team-social-btn:hover { transform: translateY(-1px); }
        .team-social-linkedin { background: rgba(10,102,194,0.1); border-color: rgba(10,102,194,0.25); color: #60a5fa; }
        .team-social-linkedin:hover { background: rgba(10,102,194,0.2); }
        .team-social-github { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #e5e7eb; }
        .team-social-github:hover { background: rgba(255,255,255,0.1); }
        .team-social-instagram { background: rgba(225,48,108,0.08); border-color: rgba(225,48,108,0.2); color: #f472b6; }
        .team-social-instagram:hover { background: rgba(225,48,108,0.15); }
        .team-social-portfolio { background: rgba(46,125,79,0.1); border-color: rgba(46,125,79,0.25); color: #4ade80; }
        .team-social-portfolio:hover { background: rgba(46,125,79,0.2); }

        /* College badge */
        .team-college { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #4b5563; display: flex; align-items: center; gap: 6px; }

        /* Bottom CTA */
        .team-cta { text-align: center; margin-top: 72px; padding: 48px 32px; background: rgba(46,125,79,0.06); border: 1px solid rgba(46,125,79,0.12); border-radius: 24px; }
        .team-cta-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .team-cta-sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
        .team-cta-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #2e7d4f; color: #fff; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all .15s; }
        .team-cta-btn:hover { background: #3fa066; }

        @media (max-width: 640px) {
          .team-grid { grid-template-columns: 1fr; }
          .team-stats { gap: 28px; }
        }
      `}</style>

      <div className="team-page">
        <Navbar dark={true} />

        <div className="team-wrap">

          {/* Back button */}
          <button className="team-back" onClick={() => navigate(-1)}>
            <span className="team-back-ico">
              <ArrowLeft size={15} />
            </span>
            {t('common.goBack')}
          </button>

          {/* Hero */}
          <div className="team-hero">
            <span className="team-eyebrow">Syntax Squad</span>
            <h1 className="team-hero-title">
              {t('team.minds')}<br />
              <span>KrishiAI</span>
            </h1>
            <p className="team-hero-sub">
              Five passionate engineers from Technocrats Institute of Technology, Bhopal —
              united by one mission: making AI accessible for every Indian farmer.
            </p>

            <div className="team-stats">
              {[
                { val: '5', label: 'Team Members' },
                { val: '8+', label: 'Features Built' },
                { val: '3rd', label: 'Year Students' },
                { val: 'CSE-AIML', label: 'Branch' },
              ].map((s, i) => (
                <div key={i} className="team-stat-item">
                  <p className="team-stat-val">{s.val}</p>
                  <p className="team-stat-label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="team-grid">
            {team.map((member, i) => (
              <div
                key={i}
                className="team-card"
                style={{ '--accent': member.color }}
              >
                <style>{`.team-card:nth-child(${i + 1})::before { background: ${member.color}; }`}</style>

                <div
                  className="team-avatar"
                  style={{ background: member.color + '22', border: `1px solid ${member.color}44` }}
                >
                  <span style={{ color: member.color }}>{member.initials}</span>
                </div>

                <h3 className="team-card-name">{member.name}</h3>
                <span
                  className="team-card-role"
                  style={{
                    background: member.color + '18',
                    color: member.color,
                    border: `1px solid ${member.color}30` 
                  }}
                >
                  {member.role}
                </span>
                <p className="team-card-year">{member.year}</p>
                <p className="team-card-about">{member.about}</p>

                <div className="team-socials">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-social-btn team-social-linkedin">
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="team-social-btn team-social-github">
                      <Github size={13} /> GitHub
                    </a>
                  )}
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="team-social-btn team-social-instagram">
                      <Instagram size={13} /> Instagram
                    </a>
                  )}
                  {member.portfolio && (
                    <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="team-social-btn team-social-portfolio">
                      <Globe size={13} /> Portfolio
                    </a>
                  )}
                </div>

                <div className="team-college">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: member.color, flexShrink: 0 }} />
                  {member.college}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="team-cta">
            <h2 className="team-cta-title">Want to collaborate?</h2>
            <p className="team-cta-sub">
              We are open to feedback, partnerships, and opportunities.
              Reach out to us!
            </p>
            <a href="/contact" className="team-cta-btn">
              <ExternalLink size={15} /> Get in Touch
            </a>
          </div>

        </div>

        <LandingFooter />
      </div>
    </>
  );
};

export default TeamPage;
