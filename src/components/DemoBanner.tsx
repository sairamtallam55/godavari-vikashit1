import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { getUIText } from '../i18n/translations';

interface Props {
  lang: Language;
}

export const DemoBanner: React.FC<Props> = ({ lang }) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 text-slate-950 font-bold px-3 py-1.5 text-xs text-center flex items-center justify-center gap-2 shadow-sm">
      <AlertTriangle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
      <span className="tracking-wide">
        {getUIText('demoNotice', lang)}
      </span>
      <span className="hidden sm:inline-block text-[11px] font-medium bg-slate-950/20 px-2 py-0.5 rounded text-slate-900">
        Pushkaralu 2027 Innovation Edition
      </span>
    </div>
  );
};
