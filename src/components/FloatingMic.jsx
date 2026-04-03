import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MicButton from './MicButton';

const FloatingMic = () => {
  const [lastTranscript, setLastTranscript] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleVoiceResult = (transcript) => {
    setLastTranscript(transcript);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);

    const lower = transcript.toLowerCase();

    // Smart routing based on what user says
    if (
      lower.includes('mausam') || lower.includes('weather') ||
      lower.includes('mausam batao') || lower.includes('weather batao')
    ) {
      navigate('/dashboard?weather=true');
    } else if (
      lower.includes('bimari') || lower.includes('rog') ||
      lower.includes('disease') || lower.includes('scan') ||
      lower.includes('patta') || lower.includes('leaf')
    ) {
      navigate('/detection');
    } else if (
      lower.includes('mandi') || lower.includes('price') ||
      lower.includes('bhav') || lower.includes('rate') ||
      lower.includes('keemat')
    ) {
      navigate('/dashboard');
      // scroll to mandi section
      setTimeout(() => {
        document.getElementById('mandi-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else if (
      lower.includes('profile') || lower.includes('account') ||
      lower.includes('settings')
    ) {
      navigate('/profile');
    } else if (
      lower.includes('inventory') || lower.includes('fasal') ||
      lower.includes('crops') || lower.includes('kheti')
    ) {
      navigate('/inventory');
    } else {
      // Default: send to chat
      navigate(`/dashboard?chat=true&message=${encodeURIComponent(transcript)}`);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 90, right: 24, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {showTooltip && lastTranscript && (
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl px-5 py-3 shadow-xl max-w-[240px] text-right transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] uppercase font-bold text-krishi-400 tracking-wider mb-1">Live Transcript</p>
          <p className="text-[15px] font-bold text-krishi-800 font-nunito leading-tight">
            "{lastTranscript}"
          </p>
        </div>
      )}
      <MicButton
        size="lg"
        variant="floating"
        tooltip="Kuch bhi boliye — Hindi mein"
        onResult={handleVoiceResult}
      />
    </div>
  );
};

export default FloatingMic;