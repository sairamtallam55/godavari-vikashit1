import React, { useState, useEffect } from 'react';
import { HeritageDestination, Language } from '../types';
import { adminLogin } from '../services/apiClient';
import { getUIText } from '../i18n/translations';
import {
  Shield,
  Lock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  LogOut,
  Sparkles,
  MapPin,
  MessageSquare,
} from 'lucide-react';

interface Props {
  destinations: HeritageDestination[];
  onAddDestination: (dest: HeritageDestination) => void;
  onDeleteDestination: (id: string) => void;
  lang: Language;
}

export const AdminDashboardPage: React.FC<Props> = ({
  destinations,
  onAddDestination,
  onDeleteDestination,
  lang,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('godavari_admin_auth');
  });
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // New Destination Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameTe, setNewNameTe] = useState('');
  const [newCategory, setNewCategory] = useState<'ghat' | 'temple' | 'architecture' | 'nature'>('ghat');
  const [newDistrict, setNewDistrict] = useState('');
  const [newLat, setNewLat] = useState('17.0005');
  const [newLng, setNewLng] = useState('81.7766');
  const [newPeriod, setNewPeriod] = useState('Ancient');
  const [newVerification, setNewVerification] = useState<'VERIFIED' | 'DEMO'>('DEMO');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    const res = await adminLogin(passcode);
    setIsLoggingIn(false);

    if (res.success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('godavari_admin_auth', 'true');
      fetchStats();
    } else {
      setErrorMsg(res.error || 'Invalid curator passcode. Use PUSHKAR2027.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('godavari_admin_auth');
  };

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameEn) return;

    const newDest: HeritageDestination = {
      id: `dest_custom_${Date.now()}`,
      name: {
        en: newNameEn,
        te: newNameTe || newNameEn,
        hi: newNameEn,
      },
      tagline: {
        en: `${newNameEn} Heritage Site`,
        te: `${newNameEn} చారిత్రక క్షేత్రం`,
        hi: `${newNameEn} ऐतिहासिक स्थल`,
      },
      category: newCategory,
      district: newDistrict || 'Godavari Delta',
      state: 'Andhra Pradesh',
      coordinates: {
        lat: parseFloat(newLat) || 17.0,
        lng: parseFloat(newLng) || 81.7,
      },
      period: newPeriod,
      description: {
        en: `Curated heritage destination along the Godavari basin recorded for Pushkaralu 2027.`,
        te: `గోదావరి పుష్కరాలు 2027 కోసం నమోదు చేసిన పవిత్ర క్షేత్రం.`,
        hi: `गोदावरी पुष्करालु 2027 के लिए सूचीबद्ध पावन तीर्थ स्थल।`,
      },
      significance: {
        en: `Regional pilgrimage and architectural site.`,
        te: `ప్రాంతీయ సాంస్కృతిక మరియు వాస్తుశిల్ప ప్రాధాన్యత కలిగిన క్షేత్రం.`,
        hi: `क्षेत्रीय तीर्थ एवं वास्तुकला की दृष्टि से महत्वपूर्ण स्थल।`,
      },
      pushkaraluSignificance: {
        en: `Designated holy bathing and congregation venue.`,
        te: `పుష్కర స్నానాలు మరియు భక్తుల సమూహాలకు కేటాయించిన పవిత్ర స్థలం.`,
        hi: `पुष्करालु स्नान एवं जनसमूह के लिए निर्धारित पवित्र स्थल।`,
      },
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      has3DModel: false,
      hasVirtualTour: false,
      verificationStatus: newVerification,
      isDemo: newVerification === 'DEMO',
      keyFeatures: ['Pushkaralu 2027', 'Pilgrimage'],
    };

    onAddDestination(newDest);
    setShowAddModal(false);
    setNewNameEn('');
    setNewNameTe('');
    fetchStats();
  };

  // If not authenticated, render strict login form
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto w-full">
        <div className="w-full rounded-3xl border border-amber-500/40 bg-slate-900/90 p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heritage text-white">
              Curator & Admin Portal
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Restricted to authorized Godavari Pushkaralu 2027 committee curators and heritage researchers.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 text-left">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Curator Passcode (Demo: PUSHKAR2027)
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access passcode..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span>{isLoggingIn ? 'Verifying Credentials...' : 'Authenticate Access'}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            For evaluation, use authorized hackathon passcode: <strong>PUSHKAR2027</strong> or <strong>VIRASAT2027</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto w-full">
      {/* Admin Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized Curator Console</span>
          </div>
          <h1 className="text-2xl font-bold font-heritage text-white">
            Pushkaralu 2027 Heritage Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Supervise destinations, 3D model records, verification flags, and attendee suggestions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto transition border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-2xl font-black text-amber-400">{destinations.length}</div>
          <div className="text-xs text-slate-400 mt-1">Total Destinations</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-2xl font-black text-emerald-400">
            {destinations.filter((d) => d.verificationStatus === 'VERIFIED').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Verified Sites</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-2xl font-black text-sky-400">
            {destinations.filter((d) => d.isDemo || d.verificationStatus === 'DEMO').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Demonstration Records</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-2xl font-black text-amber-300">8 Models</div>
          <div className="text-xs text-slate-400 mt-1">3D Artifacts Active</div>
        </div>
      </div>

      {/* Destination Management Table & Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-heritage text-white">
              Heritage Destinations Registry ({destinations.length})
            </h2>
            <p className="text-xs text-slate-400">
              Manage pilgrimage locations and verify historical authenticity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Name & District</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Coordinates</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {destinations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{d.name.en}</div>
                    <div className="text-[11px] text-slate-400">{d.district}, {d.state}</div>
                  </td>
                  <td className="py-3 px-3 uppercase text-amber-300 font-mono text-[11px]">
                    {d.category}
                  </td>
                  <td className="py-3 px-3">
                    {d.verificationStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {d.coordinates.lat.toFixed(4)}, {d.coordinates.lng.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteDestination(d.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 hover:bg-red-900 transition"
                      title="Remove Destination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Destination Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heritage text-white">Add New Heritage Destination</h3>
            <form onSubmit={handleCreateDestination} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Name (English)</label>
                <input
                  type="text"
                  required
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="e.g. Someswara Swamy Temple"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Name (Telugu)</label>
                <input
                  type="text"
                  value={newNameTe}
                  onChange={(e) => setNewNameTe(e.target.value)}
                  placeholder="e.g. సోమేశ్వర స్వామి దేవాలయం"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ghat">Pushkar Ghat</option>
                    <option value="temple">Sacred Temple</option>
                    <option value="architecture">Architecture</option>
                    <option value="nature">Nature / Confluence</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Verification Status</label>
                  <select
                    value={newVerification}
                    onChange={(e) => setNewVerification(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="DEMO">DEMO (Unverified)</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">District / Region</label>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="e.g. East Godavari"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
