import React, { useState } from 'react';
import {
  EmergencyCategory,
  PriorityLevel,
  SosRequest,
} from '../types';
import {
  calculatePriorityScore,
} from '../utils/priorityEngine';
import {
  isDeviceOffline,
  saveSosToOfflineQueue,
  getOfflineSosQueue,
} from '../utils/offlineQueue';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Users,
  MapPin,
  HeartPulse,
  Droplet,
  Anchor,
  Home,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CitizenSosPortalProps {
  onAddSos: (sos: SosRequest) => void;
  isSimulatedOffline: boolean;
  toggleOfflineSimulation: () => void;
  activeSosList: SosRequest[];
}

export const CitizenSosPortal: React.FC<CitizenSosPortalProps> = ({
  onAddSos,
  isSimulatedOffline,
  toggleOfflineSimulation,
  activeSosList,
}) => {
  // Form State
  const [citizenName, setCitizenName] = useState('Anusha Rao');
  const [phone, setPhone] = useState('+91 94412 88990');
  const [locationName, setLocationName] = useState('Krishna Lanka, Ward 12');
  const [headcount, setHeadcount] = useState(5);
  const [category, setCategory] = useState<EmergencyCategory>('Flooding / Trapped');
  const [needs, setNeeds] = useState<string[]>(['Drinking Water', 'Medicine', 'Rescue Boat Required']);
  const [medicalDetails, setMedicalDetails] = useState('Elderly heart patient, flood water 3.5ft on ground floor');
  const [submittedAlert, setSubmittedAlert] = useState<{ id: string; offline: boolean } | null>(null);

  // Available Categories
  const categories: EmergencyCategory[] = [
    'Flooding / Trapped',
    'Medical Emergency',
    'Rescue Boat Required',
    'Drinking Water',
    'Food Supply',
    'Shelter Needed',
    'Electricity / Power Outage',
    'Road Blockage / Bridge Collapse',
    'Missing Person',
  ];

  const availableNeeds = [
    'Drinking Water',
    'Food Supply',
    'Medicine',
    'Rescue Boat Required',
    'Blankets / Dry Clothing',
    'Infant Milk / Diapers',
    'Flashlight / Powerbank',
    'First Aid Trauma Kit',
  ];

  const toggleNeed = (need: string) => {
    if (needs.includes(need)) {
      setNeeds(needs.filter((n) => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  // Live Priority Score Preview
  const priorityPreview = calculatePriorityScore(
    category,
    headcount,
    needs,
    medicalDetails,
    true // Assuming worst-case isolation in preview
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const offline = isDeviceOffline();

    const newSos: SosRequest = {
      id: `sos-${Date.now()}`,
      timestamp: 'Just now',
      citizenName,
      phone,
      locationName,
      coordinates: [16.5050 + (Math.random() - 0.5) * 0.02, 80.6300 + (Math.random() - 0.5) * 0.02],
      headcount,
      category,
      urgency: priorityPreview.level,
      needs,
      medicalDetails,
      priorityScore: priorityPreview.score,
      priorityReasons: priorityPreview.reasons,
      status: 'Pending',
      isOfflineSynced: !offline,
    };

    if (offline) {
      saveSosToOfflineQueue(newSos);
      setSubmittedAlert({ id: newSos.id, offline: true });
    } else {
      onAddSos(newSos);
      setSubmittedAlert({ id: newSos.id, offline: false });
    }

    setTimeout(() => setSubmittedAlert(null), 6000);
  };

  const offlineQueue = getOfflineSosQueue();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Offline Hackathon Demo Guidance Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-600/40 rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isSimulatedOffline ? 'bg-amber-600 text-white' : 'bg-slate-800 text-emerald-400'}`}>
              {isSimulatedOffline ? <WifiOff className="w-5 h-5 animate-pulse" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Low-Connectivity PWA Engine
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Hackathon Live Demo Ready
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {isSimulatedOffline
                  ? '⚠️ Device is currently in OFFLINE mode. Requests are cached in LocalStorage/IndexedDB and will auto-sync to HQ when connection restores.'
                  : '🟢 Device has active connectivity. You can test the offline workflow by toggling simulated offline mode.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleOfflineSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isSimulatedOffline
                ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-lg'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSimulatedOffline ? 'Reconnect Wi-Fi (Auto-Sync Queue)' : 'Simulate Turn Off Wi-Fi'}
          </button>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submittedAlert && (
        <div
          className={`p-4 rounded-xl border shadow-xl flex items-center justify-between text-xs animate-in fade-in duration-300 ${
            submittedAlert.offline
              ? 'bg-amber-950/80 border-amber-600 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {submittedAlert.offline ? (
              <Layers className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <strong className="block text-sm">
                {submittedAlert.offline
                  ? 'SOS Saved Locally (Offline Queue)!'
                  : 'SOS Transmitted to Command Operations!'}
              </strong>
              <span>
                {submittedAlert.offline
                  ? 'No internet connection detected. Request is securely queued on your device and will transmit instantly once network returns.'
                  : `Assigned ID ${submittedAlert.id}. Prioritized with score ${priorityPreview.score}/100 and displayed on live map.`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: SOS Submission Form & Live Priority Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (Span 2) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white">Create Emergency SOS Request</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Citizen assistance dispatch intake. Works offline without internet connectivity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Identity & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Citizen / Reporter Name</label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-red-500"
                  placeholder="e.g. Ramesh Varma"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-red-500"
                  placeholder="+91 98480 XXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Specific Location / Landmark</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 p-2.5 text-slate-200 focus:outline-none focus:border-red-500"
                    placeholder="Village or street landmark"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Number of Trapped Persons (Headcount)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={headcount}
                    onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-red-500 font-bold"
                  />
                  <span className="text-slate-400 text-[11px]">trapped or in urgent need</span>
                </div>
              </div>
            </div>

            {/* Emergency Category */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Primary Emergency Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                      category === cat
                        ? 'bg-red-600/20 text-red-300 border-red-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Needs Checklist */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Immediate Relief Needs</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableNeeds.map((need) => {
                  const isChecked = needs.includes(need);
                  return (
                    <button
                      type="button"
                      key={need}
                      onClick={() => toggleNeed(need)}
                      className={`p-2 rounded-lg text-left text-[11px] font-medium border flex items-center space-x-1.5 ${
                        isChecked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${isChecked ? 'bg-amber-400 text-slate-950' : 'border border-slate-600'}`}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span className="truncate">{need}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medical / Vulnerability Details */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Clinical Condition / Trapped Constraints
              </label>
              <textarea
                rows={2}
                value={medicalDetails}
                onChange={(e) => setMedicalDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-red-500 resize-none text-xs"
                placeholder="Mention elderly, infants, heart patients, insulin dependency, water depth..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-xl shadow-red-950/60 transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>
                {isDeviceOffline() ? 'Submit SOS to Offline Queue (Instant Sync)' : 'Broadcast Live SOS to Responders'}
              </span>
            </button>
          </form>
        </div>

        {/* Priority Engine Preview & Explainability Column */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">Algorithmic Priority Score</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Transparent multi-factor triage score calculated before dispatching human responders.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center mb-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                COMPUTED PRIORITY SCORE
              </span>
              <div
                className={`text-4xl font-black font-mono my-1 ${
                  priorityPreview.score >= 85
                    ? 'text-red-400'
                    : priorityPreview.score >= 70
                    ? 'text-amber-400'
                    : 'text-yellow-400'
                }`}
              >
                {priorityPreview.score}
                <span className="text-xl text-slate-500 font-normal">/100</span>
              </div>
              <span
                className={`inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  priorityPreview.level === 'Critical'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {priorityPreview.level} Urgency
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Explainable Score Factors:
              </span>
              <div className="space-y-1.5">
                {priorityPreview.reasons.map((r, i) => (
                  <div key={i} className="flex items-start space-x-2 text-[11px] bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
                    <span className="text-amber-400 font-bold shrink-0">✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Offline Queue Inspector */}
          {offlineQueue.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 shadow-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Offline Storage Backlog ({offlineQueue.length})</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Pending Sync</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                These requests were submitted while Wi-Fi was disconnected and remain safely cached in the browser's storage.
              </p>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {offlineQueue.map((item) => (
                  <div key={item.id} className="bg-slate-900/90 p-2 rounded text-[11px] border border-amber-900/40 text-slate-300 flex justify-between">
                    <div>
                      <strong className="text-white block">{item.category}</strong>
                      <span>{item.locationName} ({item.headcount} ppl)</span>
                    </div>
                    <span className="text-red-400 font-mono font-bold">{item.priorityScore}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Triaged SOS Incidents Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Live Triaged Emergency Incidents ({activeSosList.length})
            </h3>
            <p className="text-xs text-slate-400">
              Real-time feed sorted by priority score, with duplicate clusters and rescue dispatch status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {activeSosList.map((sos) => (
            <div
              key={sos.id}
              className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                sos.priorityScore >= 90
                  ? 'bg-red-950/40 border-red-800/80'
                  : sos.priorityScore >= 75
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{sos.category}</span>
                    {sos.isOfflineSynced && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30">
                        PWA Synced
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-400" /> {sos.locationName} • {sos.timestamp}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-red-400 font-mono block">
                    {sos.priorityScore}/100
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">{sos.urgency}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {sos.needs.map((n) => (
                  <span key={n} className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">
                    {n}
                  </span>
                ))}
              </div>

              {sos.medicalDetails && (
                <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                  <strong className="text-rose-300">Notes:</strong> {sos.medicalDetails}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span>Reporter: <strong>{sos.citizenName}</strong> ({sos.phone})</span>
                <span className="text-emerald-400 font-semibold">Headcount: {sos.headcount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
