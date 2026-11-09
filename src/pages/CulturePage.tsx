import React, { useState } from 'react';
import { CulturalArticle, Language } from '../types';
import { AudioNarrationButton } from '../components/AudioNarrationButton';
import { getUIText } from '../i18n/translations';
import {
  BookOpen,
  Search,
  Clock,
  User,
  Tag,
  ArrowRight,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  articles: CulturalArticle[];
  selectedArticleId?: string;
  lang: Language;
}

export const CulturePage: React.FC<Props> = ({ articles, selectedArticleId, lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<CulturalArticle | null>(() => {
    return articles.find((a) => a.id === selectedArticleId) || null;
  });

  const categories = [
    { id: 'all', label: getUIText('filterAll', lang) },
    { id: 'festivals', label: 'Pushkaralu Festivals' },
    { id: 'figures', label: 'Historic Figures' },
    { id: 'architecture', label: 'Temple Architecture' },
    { id: 'music_dance', label: 'Classical Dance' },
    { id: 'crafts', label: 'Folk Crafts' },
    { id: 'culinary', label: 'Godavari Ruchulu' },
    { id: 'folklore', label: 'Folklore & Ballads' },
  ];

  const filtered = articles.filter((a) => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle =
        a.title.en.toLowerCase().includes(q) ||
        a.title.te.toLowerCase().includes(q) ||
        a.title.hi.toLowerCase().includes(q);
      const matchTags = a.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Telugu Cultural Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
          Culture, Traditions & Living Heritage
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Deep-dive into the sacred lore of Godavari Pushkaralu, Eastern Chalukyan art, Atreyapuram delicacies, Kondapalli woodcraft, and river folklore.
        </p>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cultural narratives, crafts, traditions..."
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div className="relative h-44 overflow-hidden bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.title.en}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-amber-500/30">
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
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> {item.readTime}
                </span>
                <span>{item.author}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 gap-4">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                  {item.title[lang] || item.title.en}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {item.summary[lang] || item.summary.en}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveArticle(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>{getUIText('readMore', lang)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Read-More Full Modal View */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/70">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeArticle.category}
                  </span>
                  <span className="text-xs text-slate-400">{activeArticle.readTime}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-heritage text-white">
                  {activeArticle.title[lang] || activeArticle.title.en}
                </h2>
                <div className="text-xs text-slate-400 mt-1">Author: {activeArticle.author}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <AudioNarrationButton
                  textToRead={activeArticle.content[lang] || activeArticle.content.en}
                  lang={lang}
                />
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  aria-label="Close article modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-4">
              <div className="h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 mb-6">
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title.en}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                {activeArticle.content[lang] || activeArticle.content.en}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                {activeArticle.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-amber-300/90"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
