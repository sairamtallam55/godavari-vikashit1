import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HeritageDestination, Language } from '../types';
import { calculateDistanceKm } from '../utils/heritageLogic';
import { getUIText } from '../i18n/translations';
import { MapPin, Navigation, Compass, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  destinations: HeritageDestination[];
  selectedDestination: HeritageDestination | null;
  onSelectDestination: (dest: HeritageDestination) => void;
  lang: Language;
}

export const LeafletMap: React.FC<Props> = ({
  destinations,
  selectedDestination,
  onSelectDestination,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on the Godavari Basin (Rajahmundry region)
    const map = L.map(mapContainerRef.current, {
      center: [17.0005, 81.7766],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers whenever destinations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    destinations.forEach((dest) => {
      const isVerified = dest.verificationStatus === 'VERIFIED';
      const color =
        dest.category === 'ghat'
          ? '#0284c7'
          : dest.category === 'temple'
          ? '#f59e0b'
          : dest.category === 'architecture'
          ? '#d97706'
          : '#10b981';

      // Custom SVG Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-heritage-pin',
        html: `
          <div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            cursor: pointer;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #ffffff;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${color};">
              ${dest.category}
            </span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: ${
              isVerified ? '#dcfce7' : '#fef3c7'
            }; color: ${isVerified ? '#15803d' : '#b45309'}; font-weight: 700;">
              ${isVerified ? 'VERIFIED' : 'DEMO'}
            </span>
          </div>
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
            ${dest.name[lang] || dest.name.en}
          </h4>
          <p style="margin: 4px 0 8px 0; font-size: 11px; color: #475569; line-height: 1.3;">
            ${dest.tagline[lang] || dest.tagline.en}
          </p>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
            ${dest.district}, ${dest.state}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectDestination(dest);
      });

      markersRef.current[dest.id] = marker;
    });
  }, [destinations, lang, onSelectDestination]);

  // Pan to selected destination
  useEffect(() => {
    if (!selectedDestination || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedDestination.coordinates.lat, selectedDestination.coordinates.lng],
      11,
      { duration: 1.2 }
    );
    const marker = markersRef.current[selectedDestination.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedDestination]);

  // Handle User Location Permission
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsDetectingLocation(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 9);

          // Add user pulse pin
          const userIcon = L.divIcon({
            className: 'user-location-pin',
            html: `
              <div style="
                background: #3b82f6;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid #ffffff;
                box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.4);
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          L.marker([coords.lat, coords.lng], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<strong>Your Current Location</strong>')
            .openPopup();
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError('Location permission denied or unavailable.');
        console.warn('Geolocation error:', err);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950">
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/30 text-xs font-semibold text-amber-300 hover:text-amber-200 shadow-xl transition"
        >
          <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
          <span>{isDetectingLocation ? 'Detecting...' : getUIText('myLocation', lang)}</span>
        </button>

        {locationError && (
          <div className="text-[11px] px-2.5 py-1 rounded bg-red-950/90 border border-red-500/40 text-red-200">
            {locationError}
          </div>
        )}
      </div>

      {/* Selected Destination Floating Card (Bottom Docked) */}
      {selectedDestination && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-10 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-4 shadow-2xl text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedDestination.category}
                </span>
                {selectedDestination.verificationStatus === 'VERIFIED' ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                    <AlertCircle className="w-3 h-3" /> DEMO
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white">
                {selectedDestination.name[lang] || selectedDestination.name.en}
              </h4>
            </div>

            {userLocation && (
              <div className="text-right text-[11px] text-amber-300 font-mono">
                {calculateDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  selectedDestination.coordinates.lat,
                  selectedDestination.coordinates.lng
                )}{' '}
                km away
              </div>
            )}
          </div>

          <p className="text-slate-300 line-clamp-2 mt-2 text-[11px] leading-relaxed">
            {selectedDestination.description[lang] || selectedDestination.description.en}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              {selectedDestination.district}, {selectedDestination.state}
            </span>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDestination.coordinates.lat},${selectedDestination.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow transition"
            >
              <span>{getUIText('getDirections', lang)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
