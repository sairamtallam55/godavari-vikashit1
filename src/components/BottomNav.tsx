import React from 'react';
import { Sparkles, Camera, Box, Compass, Bot, Menu } from 'lucide-react';
import { Language } from '../types';
import { getUIText } from '../i18n/translations';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  lang: Language;
}

export const BottomNav: React.FC<Props> = ({ currentRoute, onNavigate, lang }) => {
  const tabs = [
    { id: 'home', label: getUIText('navHome', lang), icon: Sparkles },
    { id: 'ar', label: 'AR', icon: Camera, highlight: true },
    { id: 'gallery', label: '3D', icon: Box },
    { id: 'tours', label: 'Tours', icon: Compass },
    { id: 'ai-guide', label: 'AI Guide', icon: Bot },
    { id: 'map', label: 'Map', icon: Menu },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-amber-500/30 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : tab.highlight
                  ? 'text-amber-300 hover:text-amber-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive
                    ? 'bg-amber-500/20 border border-amber-500/40 shadow'
                    : tab.highlight
                    ? 'bg-amber-500/10'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
