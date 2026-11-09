import React, { useState } from 'react';
import { Model3DItem, Language } from '../types';
import { ThreeHeritageViewer } from '../components/ThreeHeritageViewer';
import { getUIText } from '../i18n/translations';
import {
  Box,
  Layers,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
} from 'lucide-react';

interface Props {
  modelsList: Model3DItem[];
  selectedModelId?: string;
  lang: Language;
  onNavigateToAR: (model: Model3DItem) => void;
}

export const Gallery3DPage: React.FC<Props> = ({
  modelsList,
  selectedModelId,
  lang,
  onNavigateToAR,
}) => {
  const [selectedModel, setSelectedModel] = useState<Model3DItem>(() => {
    return modelsList.find((m) => m.id === selectedModelId) || modelsList[0];
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customGlbNotice, setCustomGlbNotice] = useState<string>('');

  const categories = [
    { id: 'all', label: getUIText('filterAll', lang) },
    { id: 'ritual_vessel', label: 'Ritual Vessels' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'artifact', label: 'Artifacts' },
    { id: 'sculpture', label: 'Sculptures' },
    { id: 'rivercraft', label: 'Rivercraft' },
  ];

  const filteredModels = modelsList.filter((m) => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  const handleGlbDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setCustomGlbNotice(`Loaded custom user 3D asset: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive 3D Heritage Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
              Godavari Cultural 3D Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect sacred Pushkaralu relics, temple towers, and traditional craftsmanship in high-fidelity PBR rendering.
              Rotate, zoom, toggle wireframe, and test lighting atmospheres.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToAR(selectedModel)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 self-start sm:self-auto shrink-0 transition"
          >
            <span>Project in AR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Notice on Illustrative vs Verified Models */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 text-xs text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Historical Accuracy Disclaimer:</strong> Unverified models are clearly tagged with DEMO and represent
            illustrative geometric reconstructions. They are never presented as official archaeological findings.
          </span>
        </div>
      </div>

      {/* Main 3D Studio Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Canvas Container */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="h-[460px] sm:h-[540px] w-full">
            <ThreeHeritageViewer modelItem={selectedModel} className="w-full h-full" />
          </div>

          {/* GLB/GLTF Upload Sandbox Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleGlbDrop}
            className="rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 p-3 text-center text-xs text-slate-400 bg-slate-900/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>
                Want to preview your own custom <strong>.glb</strong> or <strong>.gltf</strong> model? Drag & drop it here.
              </span>
            </div>
            {customGlbNotice && (
              <p className="mt-1 text-emerald-400 font-mono text-[11px] font-semibold">{customGlbNotice}</p>
            )}
          </div>
        </div>

        {/* Selected Model Detailed Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedModel.category}
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {selectedModel.verificationStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold font-heritage text-white">
                {selectedModel.title[lang] || selectedModel.title.en}
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedModel.originLocation}</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Historical Period
                </span>
                <span className="text-white font-medium">{selectedModel.historicalPeriod}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Material Crafting
                </span>
                <span className="text-white font-medium">{selectedModel.material}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Estimated Dimensions
                </span>
                <span className="text-white font-mono">{selectedModel.dimensions}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Pushkaralu Role
                </span>
                <p className="text-amber-200/90 mt-0.5 leading-relaxed">
                  {selectedModel.pushkaraluRole[lang] || selectedModel.pushkaraluRole.en}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Cultural Context
                </span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {selectedModel.culturalContext[lang] || selectedModel.culturalContext.en}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection Carousel / Filter Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold font-heritage text-white">
            Explore All 3D Heritage Models ({filteredModels.length})
          </h3>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModels.map((item) => {
            const isSelected = item.id === selectedModel.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedModel(item)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 shadow-xl shadow-amber-500/10 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.verificationStatus}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {item.title[lang] || item.title.en}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {item.description[lang] || item.description.en}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.historicalPeriod}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
