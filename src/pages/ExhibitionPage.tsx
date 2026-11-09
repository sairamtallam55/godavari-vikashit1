import React, { useState } from 'react';
import { ExhibitionItem, Language } from '../types';
import { AudioNarrationButton } from '../components/AudioNarrationButton';
import { getUIText } from '../i18n/translations';
import {
  Image,
  Calendar,
  Layers,
  Search,
  Filter,
  X,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';

interface Props {
  exhibitions: ExhibitionItem[];
  lang: Language;
}

export const ExhibitionPage: React.FC<Props> = ({ exhibitions, lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ExhibitionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: getUIText('filterAll', lang) },
    { id: 'archaeology', label: 'Archaeology & Relics' },
    { id: 'manuscript', label: 'Inscriptions & Manuscripts' },
    { id: 'photograph', label: 'Archival Photography' },
    { id: 'tool_craft', label: 'Crafting Tools' },
  ];

  const filtered = exhibitions.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle =
        item.title.en.toLowerCase().includes(q) ||
        item.title.te.toLowerCase().includes(q) ||
        item.title.hi.toLowerCase().includes(q) ||
        item.era.toLowerCase().includes(q);
      if (!matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <Image className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Digital Heritage Exhibition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
          Godavari Pushkaralu Historical Exhibition
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          A chronologically indexed showcase of maritime trade coins, copper plate inscriptions, Victorian irrigation blueprints, and archival Pushkaralu photographs.
        </p>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by era, artifact name, or material..."
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

      {/* Historical Timeline Ribbon */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 min-w-[680px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 shrink-0">
            Historical Epochs:
          </div>
          {[
            { era: 'Satavahanas', span: '2nd c. BCE - 2nd c. CE' },
            { era: 'Eastern Chalukyas', span: '7th - 11th c. CE' },
            { era: 'Kakatiyas', span: '12th - 14th c. CE' },
            { era: 'Ramadasu / Qutb Shahi', span: '17th c. CE' },
            { era: 'Cotton Irrigation Era', span: '1847 - 1852 CE' },
            { era: 'Pushkaralu 2027', span: 'Future Milestone' },
          ].map((epoch, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold text-white">{epoch.era}</span>
              <span className="text-[10px] text-slate-400 font-mono">({epoch.span})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exhibition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group"
          >
            <div className="relative h-48 overflow-hidden bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.title.en}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-amber-300 border border-amber-500/30">
                  {item.category}
                </span>
                {item.verificationStatus === 'VERIFIED' ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> DEMO
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                <span>{item.yearRange}</span>
                <span className="flex items-center gap-1 text-amber-400 group-hover:underline">
                  <ZoomIn className="w-3.5 h-3.5" /> Details
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {item.era}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1 mt-0.5">
                  {item.title[lang] || item.title.en}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description[lang] || item.description.en}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic line-clamp-1">
                Curator: {item.curatorNotes[lang] || item.curatorNotes.en}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/70">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedItem.category} • {selectedItem.era}
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-heritage text-white mt-1">
                  {selectedItem.title[lang] || selectedItem.title.en}
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Period: {selectedItem.yearRange}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <AudioNarrationButton
                  textToRead={`${selectedItem.title[lang] || selectedItem.title.en}. ${
                    selectedItem.description[lang] || selectedItem.description.en
                  }. Curator commentary: ${
                    selectedItem.curatorNotes[lang] || selectedItem.curatorNotes.en
                  }`}
                  lang={lang}
                />
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  aria-label="Close exhibition modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              <div className="h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title.en}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Artifact Provenance & Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description[lang] || selectedItem.description.en}
                </p>

                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Museum Curator Commentary
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{selectedItem.curatorNotes[lang] || selectedItem.curatorNotes.en}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
