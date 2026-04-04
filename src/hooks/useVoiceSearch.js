import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceSearch = ({ lang = 'hi-IN', onResult, onError }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  
  // Use refs to always have access to the latest callbacks without restarting the recognition
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
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
        if (onResultRef.current) onResultRef.current(transcript);
      };

      recognition.onerror = (event) => {
        setListening(false);
        // Ignore "no-speech" which normally fires if there is long silence
        if (event.error !== 'no-speech' && onErrorRef.current) {
          onErrorRef.current(event.error);
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;

      // Cleanup on unmount or lang change to avoid strict mode overlaps
      return () => {
        recognition.abort();
      };
    } else {
      console.warn('Web Speech API not supported in this browser. Use Chrome for voice search.');
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        // Handle DOMException if recognition was already successfully started under the hood
        console.error("Speech recognition start error:", error);
      }
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      setListening(false);
    }
  }, [listening]);

  return { listening, supported, startListening, stopListening };
};

export default useVoiceSearch;