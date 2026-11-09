import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Model3DItem, Language } from '../types';
import { ThreeHeritageViewer } from './ThreeHeritageViewer';
import { getUIText } from '../i18n/translations';
import {
  Camera,
  Layers,
  RotateCw,
  ZoomIn,
  Move,
  Info,
  X,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  selectedModel: Model3DItem;
  modelsList: Model3DItem[];
  onSelectModel: (model: Model3DItem) => void;
  lang: Language;
}

type ARMode = 'idle' | 'requesting' | 'active_ar' | 'denied' | 'fallback_3d';

export const ARViewer: React.FC<Props> = ({
  selectedModel,
  modelsList,
  onSelectModel,
  lang,
}) => {
  const [arMode, setArMode] = useState<ARMode>('idle');
  const [hasWebXRSupport, setHasWebXRSupport] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(true);

  // Gesture state
  const [scale, setScale] = useState<number>(1.0);
  const [rotationY, setRotationY] = useState<number>(0);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check hardware WebXR immersive-ar capabilities on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => {
          setHasWebXRSupport(supported);
        })
        .catch(() => {
          setHasWebXRSupport(false);
        });
    } else {
      setHasWebXRSupport(false);
    }
  }, []);

  // Launch Camera AR
  const handleStartAR = async () => {
    setArMode('requesting');
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera MediaDevices API is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setArMode('active_ar');
    } catch (err: any) {
      console.warn('Camera AR permission failed:', err);
      let msg = err?.message || 'Camera permission was denied.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied by the user. Please check your browser site settings.';
      } else if (err?.name === 'NotFoundError') {
        msg = 'No video capture device or rear camera was found on your device.';
      }
      setErrorMessage(msg);
      setArMode('denied');
    }
  };

  // Attach camera stream to video element when active
  useEffect(() => {
    if (arMode === 'active_ar' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [arMode]);

  // Teardown camera stream when exiting
  const handleExitAR = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setArMode('idle');
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Touch gesture handlers for mobile pinch/rotate in active AR
  const touchStartRef = useRef<{ dist: number; x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchStartRef.current = { dist, x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 1) {
      touchStartRef.current = { dist: 0, x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const diff = newDist - touchStartRef.current.dist;
      setScale((prev) => Math.max(0.3, Math.min(2.5, prev + diff * 0.005)));
      touchStartRef.current.dist = newDist;
    } else if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      setRotationY((prev) => prev + deltaX * 0.02);
      setPositionY((prev) => Math.max(-1.5, Math.min(1.5, prev - deltaY * 0.005)));
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Real AR vs Fallback Status Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{getUIText('arTitle', lang)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heritage text-white">
              {selectedModel.title[lang] || selectedModel.title.en}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {getUIText('arSubtitle', lang)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {arMode === 'active_ar' ? (
              <button
                type="button"
                onClick={handleExitAR}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-lg transition"
              >
                <X className="w-4 h-4" />
                <span>{getUIText('exitAR', lang)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setArMode('fallback_3d')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                  arMode === 'fallback_3d'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>3D Studio Fallback</span>
              </button>
            )}
          </div>
        </div>

        {/* Device & AR Hardware Detection Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Device Hardware Support:</span>
            {hasWebXRSupport === null ? (
              <span className="text-slate-400">Probing WebXR...</span>
            ) : hasWebXRSupport ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> WebXR Immersive AR Supported
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                <Camera className="w-3.5 h-3.5" /> Mobile Camera Passthrough AR Supported
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            Current Status:{' '}
            <strong className="text-amber-400 uppercase tracking-wider font-semibold">
              {arMode === 'active_ar'
                ? 'REAL CAMERA AR'
                : arMode === 'fallback_3d'
                ? '3D STUDIO FALLBACK'
                : 'READY TO LAUNCH'}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Experience Viewport */}
      {arMode === 'active_ar' ? (
        /* REAL CAMERA AR MODE VIEW */
        <div
          className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black shadow-2xl touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Live Device Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Verification Badge Over Camera */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
              <span>{getUIText('arRealNotice', lang)}</span>
            </div>
            <p className="text-[11px] text-white/90 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-mono">
              Live Rear Camera Stream Active
            </p>
          </div>

          {/* Exit Button Floating */}
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={handleExitAR}
              className="p-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-xl backdrop-blur-md"
              aria-label="Exit AR"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3D Model Spatial Projection Over Camera Feed */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${positionX}px, ${positionY * 50}px) scale(${scale})`,
            }}
          >
            <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]">
              <ThreeHeritageViewer
                modelItem={selectedModel}
                className="w-full h-full border-none bg-transparent shadow-none"
              />
            </div>
          </div>

          {/* AR Touch Gestures Guide HUD */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2">
            <div className="bg-slate-950/85 backdrop-blur-md rounded-xl p-3 border border-amber-500/30 text-xs text-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <RotateCw className="w-3.5 h-3.5" /> 1-Finger: Rotate
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <ZoomIn className="w-3.5 h-3.5" /> 2-Finger: Pinch Scale
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <Move className="w-3.5 h-3.5" /> 1-Finger Drag: Reposition
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScale(1.0);
                    setRotationY(0);
                    setPositionX(0);
                    setPositionY(0);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-200 font-medium"
                >
                  Reset Placement
                </button>
                <button
                  type="button"
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Info Panel */}
            {showInfoPanel && (
              <div className="bg-slate-950/90 backdrop-blur-md rounded-xl p-4 border border-amber-500/40 text-xs shadow-2xl">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-amber-400 text-sm">
                    {selectedModel.title[lang] || selectedModel.title.en}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedModel.originLocation}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 line-clamp-2">
                  {selectedModel.description[lang] || selectedModel.description.en}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-medium">
                    Role: {selectedModel.pushkaraluRole[lang] || selectedModel.pushkaraluRole.en}
                  </span>
                  <span className="text-slate-400">{selectedModel.dimensions}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : arMode === 'denied' ? (
        /* CAMERA PERMISSION DENIED OR UNSUPPORTED STATE */
        <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-900/90 p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-4 shadow-xl">
          <div className="p-4 rounded-full bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Camera Access Unavailable or Denied
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            {errorMessage || getUIText('cameraDenied', lang)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleStartAR}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition"
            >
              Try Requesting Camera Again
            </button>
            <button
              type="button"
              onClick={() => setArMode('fallback_3d')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-600 transition"
            >
              Switch to 3D Studio Fallback
            </button>
          </div>
        </div>
      ) : arMode === 'fallback_3d' ? (
        /* EXPLICIT 3D STUDIO FALLBACK MODE */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-sky-950/50 border border-sky-500/30 text-xs">
            <span className="text-sky-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              {getUIText('ar3DFallbackNotice', lang)}
            </span>
            <button
              type="button"
              onClick={handleStartAR}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow"
            >
              Switch to Real AR Mode
            </button>
          </div>
          <div className="w-full h-[480px] sm:h-[540px]">
            <ThreeHeritageViewer modelItem={selectedModel} className="w-full h-full" />
          </div>
        </div>
      ) : (
        /* IDLE START SCREEN WITH CLEAR ACTION BUTTON */
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900/90 p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
              <Camera className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-500 text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold font-heritage text-white">
              Launch Real Camera AR Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Experience the sacred <strong>{selectedModel.title[lang] || selectedModel.title.en}</strong> projected
              directly onto your camera view. You can inspect every detail, rotate, and scale it at true-to-life proportions.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 max-w-lg text-left text-xs space-y-2">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Privacy & Permissions Guarantee:
            </p>
            <ul className="text-slate-400 list-disc list-inside space-y-1 text-[11px]">
              <li>Camera permission is requested <strong>only after you tap the button below</strong>.</li>
              <li>Camera stream is processed locally in your browser; zero video data is recorded or uploaded.</li>
              <li>If your browser blocks camera access, you can use the 3D Studio Fallback anytime.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartAR}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 transform active:scale-95 transition"
            >
              <Camera className="w-5 h-5" />
              <span>{getUIText('startAR', lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => setArMode('fallback_3d')}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              Open 3D Studio Mode
            </button>
          </div>
        </div>
      )}

      {/* Model Selection Carousel */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
            Select 3D Heritage Artifact for AR / 3D
          </h3>
          <span className="text-xs text-slate-400">{modelsList.length} Models Curated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {modelsList.map((m) => {
            const isSelected = m.id === selectedModel.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModel(m)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                      {m.category}
                    </span>
                    {m.isDemo && (
                      <span className="text-[9px] font-mono text-amber-400/80">DEMO</span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-1">
                    {m.title[lang] || m.title.en}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.historicalPeriod}</span>
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
