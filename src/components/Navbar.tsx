import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Box,
  Compass,
  Map,
  Bot,
  BookOpen,
  Image,
  Award,
  User,
  Shield,
  Search,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { Language } from '../types';
import { getUIText } from '../i18n/translations';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  lang,
  onLanguageChange,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: getUIText('navHome', lang), icon: Sparkles },
    { id: 'ar', label: getUIText('navAR', lang), icon: Camera, highlight: true },
    { id: 'gallery', label: getUIText('nav3D', lang), icon: Box },
    { id: 'tours', label: getUIText('navTours', lang), icon: Compass },
    { id: 'map', label: getUIText('navMap', lang), icon: Map },
    { id: 'ai-guide', label: getUIText('navGuide', lang), icon: Bot },
    { id: 'culture', label: getUIText('navCulture', lang), icon: BookOpen },
    { id: 'exhibitions', label: getUIText('navExhibition', lang), icon: Image },
    { id: 'quiz', label: getUIText('navQuiz', lang), icon: Award },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Pushkaralu Badge */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40 group-hover:scale-105 transition-transform">
              <span className="font-heritage text-slate-950 font-black text-xl sm:text-2xl">GV</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-heritage font-bold tracking-wider text-gold-gradient">
                  GODAVARI VIRASAT
                </span>
                <span className="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Pushkaralu 2027
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Experience the Heritage. Explore the Godavari.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : item.highlight
                      ? 'text-amber-400 hover:bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition flex items-center gap-2 text-xs"
              title="Search Godavari Virasat (Ctrl+K)"
              aria-label="Search Godavari Virasat"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-slate-400">Search</span>
              <kbd className="hidden lg:inline text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-slate-800 transition"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase">{lang}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-amber-500/40 shadow-2xl p-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('te');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${
                      lang === 'te' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${
                      lang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('hi');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${
                      lang === 'hi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className={`p-2 rounded-xl border transition ${
                currentRoute === 'profile'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="User Profile & Progress"
              aria-label="User Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Admin Dashboard Button */}
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                currentRoute === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
              }`}
              title="Curator Admin Portal"
              aria-label="Curator Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/95 p-4 space-y-1.5 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold p-2"
            >
              <Shield className="w-4 h-4" />
              <span>Curator Admin Access</span>
            </button>
            <span className="text-[10px] text-slate-500">Pushkaralu 2027</span>
          </div>
        </div>
      )}
    </header>
  );
};
