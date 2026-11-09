import React, { useState, useEffect } from 'react';
import { Language, UserPreferences, HeritageDestination, Model3DItem, VirtualTour, CulturalArticle, QuizQuestion, ExhibitionItem } from './types';
import { HERITAGE_DESTINATIONS, HERITAGE_3D_MODELS, VIRTUAL_TOURS, CULTURAL_ARTICLES, QUIZ_QUESTIONS, EXHIBITION_ITEMS } from './data/heritageData';
import { fetchDestinations, fetch3DModels, fetchVirtualTours, fetchCulturalArticles, fetchQuizzes, fetchExhibitions } from './services/apiClient';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DemoBanner } from './components/DemoBanner';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { ARViewer } from './components/ARViewer';
import { Gallery3DPage } from './pages/Gallery3DPage';
import { VirtualToursPage } from './pages/VirtualToursPage';
import { AIGuidePage } from './pages/AIGuidePage';
import { HeritageMapPage } from './pages/HeritageMapPage';
import { CulturePage } from './pages/CulturePage';
import { ExhibitionPage } from './pages/ExhibitionPage';
import { EducationQuizPage } from './pages/EducationQuizPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { getUIText } from './i18n/translations';
import { Heart, Sparkles, Shield, MapPin, Globe } from 'lucide-react';

export default function App() {
  // Navigation & URL Hash sync
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '').split('?')[0];
    return hash || 'home';
  });
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  // Global Language state (persisted in localStorage)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('gv_lang') as Language;
    return saved === 'te' || saved === 'hi' || saved === 'en' ? saved : 'en';
  });

  // Global user preferences & bookmarks
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('gv_prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      language: 'en',
      soundEnabled: true,
      highContrast: false,
      bookmarks: ['dest_pushkar_ghat_rjy', 'dest_draksharamam'],
      completedTours: ['tour_rjy_ghats'],
      quizScores: [],
      unlockedBadges: ['godavari_acharya', 'river_explorer'],
    };
  });

  // Dataset states (populated with seed fallback & synced with REST APIs)
  const [destinations, setDestinations] = useState<HeritageDestination[]>(HERITAGE_DESTINATIONS);
  const [modelsList, setModelsList] = useState<Model3DItem[]>(HERITAGE_3D_MODELS);
  const [toursList, setToursList] = useState<VirtualTour[]>(VIRTUAL_TOURS);
  const [articles, setArticles] = useState<CulturalArticle[]>(CULTURAL_ARTICLES);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>(EXHIBITION_ITEMS);

  // Global Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync route changes with window.location.hash
  const navigateTo = (route: string, itemId?: string) => {
    setCurrentRoute(route);
    setSelectedItemId(itemId);
    window.location.hash = itemId ? `${route}?id=${itemId}` : route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '');
      const [route, query] = raw.split('?');
      if (route) {
        setCurrentRoute(route);
        if (query && query.startsWith('id=')) {
          setSelectedItemId(query.replace('id=', ''));
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update language handler
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('gv_lang', newLang);
    setPreferences((prev) => ({ ...prev, language: newLang }));
  };

  // Update preferences handler
  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('gv_prefs', JSON.stringify(next));
      return next;
    });
  };

  // Initial async API hydration (offline resilient)
  useEffect(() => {
    fetchDestinations().then(setDestinations).catch(() => {});
    fetch3DModels().then(setModelsList).catch(() => {});
    fetchVirtualTours().then(setToursList).catch(() => {});
    fetchCulturalArticles().then(setArticles).catch(() => {});
    fetchQuizzes().then(setQuizzes).catch(() => {});
    fetchExhibitions().then(setExhibitions).catch(() => {});
  }, []);

  // Admin add / delete handlers for reactive UI
  const handleAddDestination = (newDest: HeritageDestination) => {
    setDestinations((prev) => [newDest, ...prev]);
  };

  const handleDeleteDestination = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  const selectedModelForAR = modelsList.find((m) => m.id === selectedItemId) || modelsList[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Visible Demonstration Notice Banner */}
      <DemoBanner lang={lang} />

      {/* Main Top Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Page Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-20 xl:pb-12">
        {currentRoute === 'home' && (
          <HomePage
            destinations={destinations}
            modelsList={modelsList}
            toursList={toursList}
            onNavigate={navigateTo}
            lang={lang}
          />
        )}

        {currentRoute === 'ar' && (
          <div className="flex flex-col gap-6">
            <ARViewer
              selectedModel={selectedModelForAR}
              modelsList={modelsList}
              onSelectModel={(m) => setSelectedItemId(m.id)}
              lang={lang}
            />
          </div>
        )}

        {currentRoute === 'gallery' && (
          <Gallery3DPage
            modelsList={modelsList}
            selectedModelId={selectedItemId}
            lang={lang}
            onNavigateToAR={(m) => navigateTo('ar', m.id)}
          />
        )}

        {currentRoute === 'tours' && (
          <VirtualToursPage
            toursList={toursList}
            selectedTourId={selectedItemId}
            lang={lang}
          />
        )}

        {currentRoute === 'map' && (
          <HeritageMapPage
            destinations={destinations}
            selectedDestinationId={selectedItemId}
            lang={lang}
            onNavigateTo3D={(modelId) => navigateTo('gallery', modelId)}
            onNavigateToTour={(tourId) => navigateTo('tours', tourId)}
          />
        )}

        {currentRoute === 'ai-guide' && <AIGuidePage lang={lang} />}

        {currentRoute === 'culture' && (
          <CulturePage
            articles={articles}
            selectedArticleId={selectedItemId}
            lang={lang}
          />
        )}

        {currentRoute === 'exhibitions' && (
          <ExhibitionPage exhibitions={exhibitions} lang={lang} />
        )}

        {currentRoute === 'quiz' && (
          <EducationQuizPage
            questions={quizzes}
            lang={lang}
            onBadgeUnlocked={(badge) => {
              if (!preferences.unlockedBadges.includes(badge.id)) {
                handleUpdatePreferences({
                  unlockedBadges: [...preferences.unlockedBadges, badge.id],
                });
              }
            }}
          />
        )}

        {currentRoute === 'profile' && (
          <UserProfilePage
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            destinations={destinations}
            onNavigateToDestination={(destId) => navigateTo('map', destId)}
            lang={lang}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboardPage
            destinations={destinations}
            onAddDestination={handleAddDestination}
            onDeleteDestination={handleDeleteDestination}
            lang={lang}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        onNavigate={navigateTo}
      />

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav currentRoute={currentRoute} onNavigate={navigateTo} lang={lang} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-xs text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-heritage font-bold text-amber-400 text-sm tracking-wider">
                GODAVARI VIRASAT
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Pushkaralu 2027
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Immersive Digital Heritage and Cultural Exploration Platform for the Godavari Region.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button type="button" onClick={() => navigateTo('home')} className="hover:text-amber-300">
              Home
            </button>
            <button type="button" onClick={() => navigateTo('ar')} className="hover:text-amber-300">
              Mobile AR
            </button>
            <button type="button" onClick={() => navigateTo('gallery')} className="hover:text-amber-300">
              3D Gallery
            </button>
            <button type="button" onClick={() => navigateTo('tours')} className="hover:text-amber-300">
              Virtual Tours
            </button>
            <button type="button" onClick={() => navigateTo('map')} className="hover:text-amber-300">
              Heritage Map
            </button>
            <button type="button" onClick={() => navigateTo('ai-guide')} className="hover:text-amber-300">
              AI Guide
            </button>
            <button type="button" onClick={() => navigateTo('quiz')} className="hover:text-amber-300">
              Pushkar Academy
            </button>
            <button type="button" onClick={() => navigateTo('admin')} className="hover:text-amber-300 font-semibold text-amber-400">
              Admin Portal
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Dedicated to the pilgrims and cultural heritage of Mother Godavari.
          </div>
        </div>
      </footer>
    </div>
  );
}
