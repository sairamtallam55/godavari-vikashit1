import React, { useState, useEffect } from 'react';
import { UserPreferences, Language, HeritageDestination } from '../types';
import { getUIText } from '../i18n/translations';
import {
  User,
  Award,
  Bookmark,
  Compass,
  CheckCircle2,
  Trash2,
  Crown,
  ShieldCheck,
  Globe,
  Settings,
} from 'lucide-react';

interface Props {
  preferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
  destinations: HeritageDestination[];
  onNavigateToDestination: (destId: string) => void;
  lang: Language;
}

export const UserProfilePage: React.FC<Props> = ({
  preferences,
  onUpdatePreferences,
  destinations,
  onNavigateToDestination,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'bookmarks' | 'settings'>('overview');

  const bookmarkedDestinations = destinations.filter((d) =>
    preferences.bookmarks?.includes(d.id)
  );

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto w-full">
      {/* Profile Card Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-heritage font-bold text-3xl shadow-lg border-2 border-amber-300">
          <User className="w-10 h-10" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Anonymous Private Profile (No Data Collection)</span>
          </div>
          <h1 className="text-2xl font-bold font-heritage text-white">
            Pushkaralu Pilgrim Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore the heritage of the Godavari without mandatory registration. Your progress, bookmarks, and badges are stored safely in local memory.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs">
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 font-mono">
              Badges: {preferences.unlockedBadges?.length || 1}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-sky-300 border border-slate-700 font-mono">
              Saved Spots: {preferences.bookmarks?.length || 0}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-300 border border-slate-700 font-mono">
              Tours Completed: {preferences.completedTours?.length || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview & Badges', icon: Award },
          { id: 'bookmarks', label: 'Saved Destinations', icon: Bookmark },
          { id: 'settings', label: 'Preferences', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Achievement Badges Showcase */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Earned Achievement Honors</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col items-center text-center gap-2">
                <Crown className="w-8 h-8 text-amber-400" />
                <h4 className="font-bold text-white text-sm">Godavari Maha Acharya</h4>
                <p className="text-[11px] text-slate-300">
                  Mastered 100% of Godavari Pushkaralu and Regional Heritage trivia!
                </p>
                <span className="text-[10px] text-amber-300 font-mono mt-1">Unlocked</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col items-center text-center gap-2">
                <Award className="w-8 h-8 text-sky-400" />
                <h4 className="font-bold text-white text-sm">Sacred River Explorer</h4>
                <p className="text-[11px] text-slate-300">
                  Completed virtual tours of Rajahmundry ghats and Draksharamam.
                </p>
                <span className="text-[10px] text-sky-300 font-mono mt-1">Unlocked</span>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 flex flex-col items-center text-center gap-2 opacity-60">
                <Compass className="w-8 h-8 text-slate-500" />
                <h4 className="font-bold text-slate-400 text-sm">Delta Heritage Scholar</h4>
                <p className="text-[11px] text-slate-500">
                  Inspect all 8 3D models in the gallery to unlock this badge.
                </p>
                <span className="text-[10px] text-slate-500 font-mono mt-1">In Progress (4/8)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Saved Heritage Destinations ({bookmarkedDestinations.length})
          </h3>

          {bookmarkedDestinations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/40 border border-slate-800">
              No bookmarked destinations yet. You can bookmark destinations from the map or home page!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarkedDestinations.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{d.name[lang] || d.name.en}</h4>
                    <span className="text-xs text-slate-400">{d.district}, {d.state}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToDestination(d.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Application Preferences
          </h3>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Preferred Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'te', label: 'తెలుగు' },
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिन्दी' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ language: l.id as Language })}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      preferences.language === l.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <span className="text-slate-400 block text-[11px]">
                Your preferences are stored locally in your browser storage.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
