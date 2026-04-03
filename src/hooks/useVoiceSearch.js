import { useState, useEffect, useRef } from 'react';

const useVoiceSearch = ({ lang = 'hi-IN', onResult, onError }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setListening(false);
        if (onResult) onResult(transcript);
      };

      recognition.onerror = (event) => {
        setListening(false);
        if (onError) onError(event.error);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    } else {
      console.warn('Web Speech API not supported in this browser. Use Chrome for voice search.');
    }
  }, [lang]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return { listening, supported, startListening, stopListening };
};

export default useVoiceSearch;