import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Box, Compass, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Language, HeritageDestination, Model3DItem, VirtualTour, CulturalArticle } from '../types';
import { HERITAGE_DESTINATIONS, HERITAGE_3D_MODELS, VIRTUAL_TOURS, CULTURAL_ARTICLES, HERITAGE_FAQS } from '../data/heritageData';
import { getUIText } from '../i18n/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (route: string, itemId?: string) => void;
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, lang, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedDestinations = q
    ? HERITAGE_DESTINATIONS.filter(
        (d) =>
          d.name.en.toLowerCase().includes(q) ||
          d.name.te.toLowerCase().includes(q) ||
          d.name.hi.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.keyFeatures.some((k) => k.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchedModels = q
    ? HERITAGE_3D_MODELS.filter(
        (m) =>
          m.title.en.toLowerCase().includes(q) ||
          m.title.te.toLowerCase().includes(q) ||
          m.title.hi.toLowerCase().includes(q) ||
          m.material.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedTours = q
    ? VIRTUAL_TOURS.filter(
        (t) =>
          t.title.en.toLowerCase().includes(q) ||
          t.title.te.toLowerCase().includes(q) ||
          t.title.hi.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedArticles = q
    ? CULTURAL_ARTICLES.filter(
        (a) =>
          a.title.en.toLowerCase().includes(q) ||
          a.title.te.toLowerCase().includes(q) ||
          a.title.hi.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 3)
    : [];

  const matchedFaqs = q
    ? HERITAGE_FAQS.filter(
        (f) =>
          f.q.en.toLowerCase().includes(q) ||
          f.q.te.toLowerCase().includes(q) ||
          f.q.hi.toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const hasResults =
    matchedDestinations.length > 0 ||
    matchedModels.length > 0 ||
    matchedTours.length > 0 ||
    matchedArticles.length > 0 ||
    matchedFaqs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getUIText('searchPlaceholder', lang)}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-md bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!q ? (
            <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
              <Compass className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
              <p>Type to search Godavari temples, Pushkar ghats, 3D artifacts, articles, and tours.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Rajahmundry', 'Pushkaralu', 'Bhadrachalam', 'Draksharamam', 'Cotton Barrage', 'Harathi'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuery(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-800/80 text-[11px] text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching heritage records found for "{query}". Try a different keyword or explore by category.
            </div>
          ) : (
            <>
              {/* Destinations */}
              {matchedDestinations.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Heritage Destinations ({matchedDestinations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedDestinations.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          onNavigate('map', d.id);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left flex items-center justify-between group transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                            {d.name[lang] || d.name.en}
                          </div>
                          <div className="text-[11px] text-slate-400">{d.district}, {d.state} • {d.period}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Models */}
              {matchedModels.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" /> 3D Models & Artifacts ({matchedModels.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedModels.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onNavigate('gallery', m.id);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left flex items-center justify-between group transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                            {m.title[lang] || m.title.en}
                          </div>
                          <div className="text-[11px] text-slate-400">{m.material} • {m.historicalPeriod}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual Tours */}
              {matchedTours.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Virtual Tours ({matchedTours.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedTours.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onNavigate('tours', t.id);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left flex items-center justify-between group transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                            {t.title[lang] || t.title.en}
                          </div>
                          <div className="text-[11px] text-slate-400">{t.estimatedMinutes} mins • {t.stopsCount} stops</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Articles */}
              {matchedArticles.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Cultural Articles ({matchedArticles.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedArticles.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          onNavigate('culture', a.id);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left flex items-center justify-between group transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                            {a.title[lang] || a.title.en}
                          </div>
                          <div className="text-[11px] text-slate-400">{a.author} • {a.readTime}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {matchedFaqs.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Heritage FAQs ({matchedFaqs.length})
                  </h4>
                  <div className="space-y-2">
                    {matchedFaqs.map((f, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                        <div className="font-semibold text-amber-300 mb-1">{f.q[lang] || f.q.en}</div>
                        <div className="text-slate-300 text-[11px] line-clamp-2">{f.a[lang] || f.a.en}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
