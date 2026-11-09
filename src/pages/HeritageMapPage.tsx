import React, { useState } from 'react';
import { HeritageDestination, Language } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { filterDestinations } from '../utils/heritageLogic';
import { getUIText } from '../i18n/translations';
import {
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  List,
  Map as MapIcon,
} from 'lucide-react';

interface Props {
  destinations: HeritageDestination[];
  selectedDestinationId?: string;
  lang: Language;
  onNavigateTo3D: (modelId: string) => void;
  onNavigateToTour: (tourId: string) => void;
}

export const HeritageMapPage: React.FC<Props> = ({
  destinations,
  selectedDestinationId,
  lang,
  onNavigateTo3D,
  onNavigateToTour,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDest, setSelectedDest] = useState<HeritageDestination | null>(() => {
    return destinations.find((d) => d.id === selectedDestinationId) || destinations[0] || null;
  });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const categories = [
    { id: 'all', label: getUIText('filterAll', lang) },
    { id: 'ghat', label: 'Pushkar Ghats' },
    { id: 'temple', label: 'Sacred Temples' },
    { id: 'architecture', label: 'Architecture & Barrages' },
    { id: 'nature', label: 'River Confluences' },
  ];

  const filtered = filterDestinations(destinations, {
    category: activeCategory,
    searchQuery,
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Godavari Geospatial Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
              {getUIText('navMap', lang)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Discover verified pilgrimage ghats, historic stone temples, and hydraulic landmarks mapped across the 1,465 km Godavari course.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'map' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, district, or tag..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === c.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <LeafletMap
              destinations={filtered}
              selectedDestination={selectedDest}
              onSelectDestination={(d) => setSelectedDest(d)}
              lang={lang}
            />
          </div>

          {/* Side Destination Details Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {selectedDest ? (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={selectedDest.imageUrl}
                    alt={selectedDest.name.en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-amber-500/30">
                      {selectedDest.category}
                    </span>
                    {selectedDest.verificationStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> DEMO
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-heritage text-white">
                    {selectedDest.name[lang] || selectedDest.name.en}
                  </h3>
                  <div className="text-xs text-amber-300 font-mono mt-0.5">
                    {selectedDest.district}, {selectedDest.state}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {selectedDest.description[lang] || selectedDest.description.en}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Historical Era
                    </span>
                    <span className="text-white font-medium">{selectedDest.period}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Pushkaralu Significance
                    </span>
                    <p className="text-amber-200/90 text-[11px] leading-relaxed">
                      {selectedDest.pushkaraluSignificance[lang] || selectedDest.pushkaraluSignificance.en}
                    </p>
                  </div>
                </div>

                {/* Shortcuts to 3D and Tour */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                  {selectedDest.has3DModel && selectedDest.modelId && (
                    <button
                      type="button"
                      onClick={() => onNavigateTo3D(selectedDest.modelId!)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold transition"
                    >
                      Inspect 3D Artifact
                    </button>
                  )}
                  {selectedDest.hasVirtualTour && selectedDest.tourId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTour(selectedDest.tourId!)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 text-xs font-semibold transition"
                    >
                      Start Virtual Tour
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40">
                Select a marker on the map to view details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Directory List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden p-5 flex flex-col justify-between gap-4 hover:border-amber-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300">
                    {d.category}
                  </span>
                  {d.verificationStatus === 'VERIFIED' ? (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> DEMO
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">
                  {d.name[lang] || d.name.en}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">{d.district}, {d.state} • {d.period}</div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {d.description[lang] || d.description.en}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDest(d);
                    setViewMode('map');
                  }}
                  className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Locate on Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${d.coordinates.lat},${d.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
