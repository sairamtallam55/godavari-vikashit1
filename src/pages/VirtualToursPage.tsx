import React, { useState } from 'react';
import { VirtualTour, Language } from '../types';
import { AudioNarrationButton } from '../components/AudioNarrationButton';
import { getUIText } from '../i18n/translations';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  toursList: VirtualTour[];
  selectedTourId?: string;
  lang: Language;
}

export const VirtualToursPage: React.FC<Props> = ({
  toursList,
  selectedTourId,
  lang,
}) => {
  const [selectedTour, setSelectedTour] = useState<VirtualTour>(() => {
    return toursList.find((t) => t.id === selectedTourId) || toursList[0];
  });
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);

  const currentStop = selectedTour.stops[currentStopIndex] || selectedTour.stops[0];
  const progressPercent = Math.round(((currentStopIndex + 1) / selectedTour.stops.length) * 100);

  const handlePrevStop = () => {
    if (currentStopIndex > 0) setCurrentStopIndex(currentStopIndex - 1);
  };

  const handleNextStop = () => {
    if (currentStopIndex < selectedTour.stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    }
  };

  const handleSelectTour = (tour: VirtualTour) => {
    setSelectedTour(tour);
    setCurrentStopIndex(0);
  };

  // Text for audio narration
  const narrationText = `${currentStop.title[lang] || currentStop.title.en}. ${
    currentStop.description[lang] || currentStop.description.en
  }. Historical context: ${currentStop.historicalNote[lang] || currentStop.historicalNote.en}`;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-sky-500/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Interactive Virtual Heritage Tours</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
              {selectedTour.title[lang] || selectedTour.title.en}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {selectedTour.subtitle[lang] || selectedTour.subtitle.en}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 text-xs font-mono">
              Era: {selectedTour.historicalEra}
            </span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 text-xs text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>DEMO CONTENT:</strong> Sample multi-stop virtual media curated for Pushkaralu demonstration.
            Photographic assets are illustrative representations.
          </span>
        </div>
      </div>

      {/* Main Virtual Tour Experience Player */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
        {/* Visual Viewport with Panorama / Stop Image */}
        <div className="relative w-full h-[380px] sm:h-[500px] overflow-hidden bg-slate-950">
          <img
            src={currentStop.imageUrl}
            alt={currentStop.title.en}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Top Stop Info Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>
                Stop {currentStopIndex + 1} of {selectedTour.stops.length}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold font-heritage text-white drop-shadow-md">
              {currentStop.title[lang] || currentStop.title.en}
            </h3>
          </div>

          {/* Audio Read-Aloud Button in Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <AudioNarrationButton textToRead={narrationText} lang={lang} />
          </div>

          {/* Navigation Arrows on Viewport Flanks */}
          <button
            type="button"
            onClick={handlePrevStop}
            disabled={currentStopIndex === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/75 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition shadow-xl"
            aria-label="Previous Stop"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNextStop}
            disabled={currentStopIndex === selectedTour.stops.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/75 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition shadow-xl"
            aria-label="Next Stop"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Viewport Bar with Progress Track */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-amber-300">
                {currentStop.title[lang] || currentStop.title.en}
              </span>
              <span className="font-mono text-slate-400">{progressPercent}% Explored</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Narrative & Historical Information Card */}
        <div className="p-6 sm:p-8 bg-slate-900/80 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Stop Narrative & Architectural Details
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentStop.description[lang] || currentStop.description.en}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Historical Significance & Vedic Records
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "{currentStop.historicalNote[lang] || currentStop.historicalNote.en}"
            </p>
          </div>
        </div>

        {/* Next/Prev Navigation Bottom Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStop}
            disabled={currentStopIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Stop</span>
          </button>

          {/* Jump to specific stops */}
          <div className="hidden sm:flex items-center gap-1.5">
            {selectedTour.stops.map((stop, idx) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setCurrentStopIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  idx === currentStopIndex
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextStop}
            disabled={currentStopIndex === selectedTour.stops.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition"
          >
            <span>Next Stop</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Other Virtual Tours Switcher */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold font-heritage text-white">
          Explore Other Virtual Tours ({toursList.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toursList.map((t) => {
            const isSelected = t.id === selectedTour.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTour(t)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/15 shadow-xl scale-[1.01]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-sky-400">
                      <Clock className="w-3 h-3" /> {t.estimatedMinutes} mins
                    </span>
                    <span>{t.stopsCount} Sacred Stops</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {t.title[lang] || t.title.en}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {t.subtitle[lang] || t.subtitle.en}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.historicalEra}</span>
                  <span className="text-sky-400 font-semibold flex items-center gap-1">
                    Play <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
