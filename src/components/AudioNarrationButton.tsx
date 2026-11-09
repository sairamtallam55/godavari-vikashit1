import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';
import { getUIText } from '../i18n/translations';

interface Props {
  textToRead: string;
  lang: Language;
  className?: string;
}

export const AudioNarrationButton: React.FC<Props> = ({ textToRead, lang, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleAudio = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);

      // Select language voice code
      utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToRead]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleAudio}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
        isPlaying
          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
          : 'bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-slate-800 hover:border-amber-400/50'
      } ${className}`}
      title={isPlaying ? getUIText('stopNarration', lang) : getUIText('listenNarration', lang)}
      aria-label={isPlaying ? 'Stop narration' : 'Listen to audio narration'}
    >
      {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-slate-950" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
      <span>{isPlaying ? getUIText('stopNarration', lang) : getUIText('listenNarration', lang)}</span>
    </button>
  );
};
