import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Box,
  Compass,
  Bot,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  Image,
  ChevronRight,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { HeritageDestination, Model3DItem, VirtualTour, Language } from '../types';
import { getUIText } from '../i18n/translations';
import { submitFeedback } from '../services/apiClient';

interface Props {
  destinations: HeritageDestination[];
  modelsList: Model3DItem[];
  toursList: VirtualTour[];
  onNavigate: (route: string, itemId?: string) => void;
  lang: Language;
}

export const HomePage: React.FC<Props> = ({
  destinations,
  modelsList,
  toursList,
  onNavigate,
  lang,
}) => {
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const featuredDestinations = destinations.slice(0, 4);
  const heroModel = modelsList[0] || null;
  const heroTour = toursList[0] || null;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackMsg) return;
    await submitFeedback({
      name: feedbackName,
      rating: feedbackRating,
      message: feedbackMsg,
      category: 'Pushkaralu 2027 Visitor Feedback',
    });
    setFeedbackSubmitted(true);
    setFeedbackName('');
    setFeedbackMsg('');
    setTimeout(() => setFeedbackSubmitted(false), 5000);
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-12 lg:p-16 shadow-2xl bg-heritage-pattern">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{getUIText('pushkaraluBadge', lang)}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heritage tracking-tight text-white leading-tight">
            GODAVARI <span className="text-gold-gradient">VIRASAT</span>
          </h1>

          <p className="text-base sm:text-xl text-amber-200/90 font-heritage italic mt-2">
            "{getUIText('tagline', lang)}"
          </p>

          <p className="text-xs sm:text-base text-slate-300 mt-4 leading-relaxed max-w-2xl">
            Welcome to the official immersive digital heritage platform for the upcoming{' '}
            <strong>Godavari Pushkaralu 2027</strong>. Explore sacred river ghats, ancient Chalukyan stone sanctums,
            3D interactive ritual artifacts, mobile AR projections, and our conversational AI heritage guide.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => onNavigate('ar')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transform active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{getUIText('startAR', lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs sm:text-sm border border-amber-500/40 hover:border-amber-400 flex items-center gap-2 transition"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>{getUIText('view3D', lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('tours')}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>{getUIText('startTour', lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('ai-guide')}
              className="px-5 py-3 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 font-semibold text-xs sm:text-sm border border-sky-500/40 flex items-center gap-2 transition"
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>{getUIText('askAIGuide', lang)}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black font-heritage text-amber-400">1,465 km</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Dakshina Ganga Course</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black font-heritage text-sky-400">12 Years</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Pushkar Celestial Cycle</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black font-heritage text-emerald-400">10+ Shrines</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Heritage Destinations</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black font-heritage text-amber-300">8 Models</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Interactive 3D / AR</div>
          </div>
        </div>
      </section>

      {/* Featured Heritage Destinations */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold mb-1">
              SACRED RIVERSIDE KSHETRAS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
              Featured Heritage Destinations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-semibold group self-start sm:self-auto"
          >
            <span>Explore all on Heritage Map</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={dest.imageUrl}
                  alt={dest.name.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {dest.category}
                  </span>
                  {dest.verificationStatus === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 backdrop-blur-md">
                      <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1 backdrop-blur-md">
                      <AlertTriangle className="w-2.5 h-2.5" /> DEMO
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {dest.name[lang] || dest.name.en}
                  </h3>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{dest.district}, {dest.state}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {dest.description[lang] || dest.description.en}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">{dest.period}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('map', dest.id)}
                    className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Model & Virtual Tour Spotlight Dual Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Spotlight */}
        {heroModel && (
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Featured 3D Artifact</span>
              </div>
              <h3 className="text-2xl font-bold font-heritage text-white">
                {heroModel.title[lang] || heroModel.title.en}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {heroModel.description[lang] || heroModel.description.en}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Material: {heroModel.material}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Period: {heroModel.historicalPeriod}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-amber-400 font-mono">Pushkaralu 2027 Model</span>
              <button
                type="button"
                onClick={() => onNavigate('gallery', heroModel.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition"
              >
                <span>Launch 3D Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tour Spotlight */}
        {heroTour && (
          <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-3">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Featured Virtual Tour</span>
              </div>
              <h3 className="text-2xl font-bold font-heritage text-white">
                {heroTour.title[lang] || heroTour.title.en}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {heroTour.subtitle[lang] || heroTour.subtitle.en}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {heroTour.stopsCount} Sacred Stops
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  ~{heroTour.estimatedMinutes} Minutes Immersion
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-sky-400 font-mono">Audio Guided Tour</span>
              <button
                type="button"
                onClick={() => onNavigate('tours', heroTour.id)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition"
              >
                <span>Begin Virtual Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quiz & Learning Academy Banner */}
      <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" /> Pushkaralu Quiz & Learning Academy
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heritage text-white">
            Test Your Knowledge of Godavari History & Traditions
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Earn official badges like <em>Godavari Maha Acharya</em>, <em>Heritage Scholar</em>, and learn through
            15 curated trivia questions with detailed historical explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('quiz')}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shrink-0 flex items-center gap-2 transition"
        >
          <span>Take Heritage Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Pushkaralu 2027 Visitor Suggestions & Feedback */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 max-w-2xl mx-auto w-full text-center">
        <h3 className="text-lg sm:text-xl font-bold font-heritage text-white">
          Pushkaralu 2027 Heritage Feedback & Suggestions
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Share suggestions for newly discovered historical sites, artisan contacts, or feature enhancements.
        </p>

        {feedbackSubmitted ? (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you! Your feedback has been recorded for the Pushkaralu 2027 committee.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="mt-4 flex flex-col gap-3 text-left">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase">Your Name</label>
              <input
                type="text"
                required
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase">Rating (1 to 5)</label>
              <select
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={5}>5 Stars - Outstanding Experience</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Needs Improvement</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase">Comments or Ideas</label>
              <textarea
                required
                rows={3}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Share insights on Godavari ghats, 3D artifacts, or historical references..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="mt-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md self-center flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Suggestion</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
