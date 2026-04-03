import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import useVoiceSearch from '../hooks/useVoiceSearch';

const MicButton = ({
  onResult,
  size = 'md',         // 'sm' | 'md' | 'lg'
  variant = 'light',   // 'light' | 'dark' | 'floating'
  lang = 'hi-IN',
  tooltip = 'Hindi mein boliye...',
}) => {
  const [error, setError] = useState(null);
  const { listening, supported, startListening, stopListening } =
    useVoiceSearch({ lang, onResult, onError: setError });

  if (!supported) return null;

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const variants = {
    light: listening
      ? 'bg-red-50 border-red-300 text-red-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      : 'bg-white border-krishi-600 text-krishi-600 hover:bg-krishi-50 shadow-sm',
    dark: listening
      ? 'bg-red-500/20 border-red-400/40 text-red-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
      : 'bg-krishi-900/10 border-krishi-800/20 text-krishi-400 hover:text-emerald-400 hover:border-emerald-400/30',
    floating: listening
      ? 'bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_8px_32px_rgba(16,185,129,0.5)]'
      : 'bg-gradient-to-br from-[#152b1e] to-[#1e4a30] text-white shadow-xl shadow-[#0c1a12]/50 hover:from-[#1e4a30] hover:to-[#152b1e] hover:-translate-y-1',
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        title={listening ? 'Bol rahe hain... (band karne ke liye dobara click karein)' : tooltip}
        onClick={() => {
          setError(null);
          listening ? stopListening() : startListening();
        }}
        className={`
          ${sizes[size]}
          ${variants[variant]}
          rounded-full border flex items-center justify-center
          transition-all duration-300 relative flex-shrink-0
          ${listening ? 'scale-110 z-10' : ''}
        `}
      >
        {listening ? (
          <>
            <MicOff size={size === 'sm' ? 13 : size === 'lg' ? 24 : 18} />
            <span className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-current opacity-10 animate-pulse" />
            <span className="absolute -inset-4 rounded-full border-2 border-current opacity-5 animate-pulse delay-75" />
          </>
        ) : (
          <Mic size={size === 'sm' ? 13 : size === 'lg' ? 24 : 18} />
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-1 text-center max-w-32">
          {error === 'not-allowed' ? 'Microphone permission required' : 'Voice recognition error'}
        </p>
      )}
    </div>
  );
};

export default MicButton;