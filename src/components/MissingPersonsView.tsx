import React, { useState } from 'react';
import { MissingPersonReport } from '../types';
import {
  Compass,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Eye,
  ShieldCheck,
  Phone,
} from 'lucide-react';

interface MissingPersonsViewProps {
  reports: MissingPersonReport[];
  onAddReport: (report: MissingPersonReport) => void;
  onAddSighting: (id: string, sightingText: string) => void;
}

export const MissingPersonsView: React.FC<MissingPersonsViewProps> = ({
  reports,
  onAddReport,
  onAddSighting,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(12);
  const [gender, setGender] = useState('Male');
  const [lastSeenLocation, setLastSeenLocation] = useState('Krishna Lanka Embankment');
  const [lastSeenTime, setLastSeenTime] = useState('09:30 AM during boat evacuation');
  const [clothingDescription, setClothingDescription] = useState('Yellow raincoat, dark trousers');
  const [contactNumber, setContactNumber] = useState('+91 94405 ');
  const [selectedPersonForSighting, setSelectedPersonForSighting] = useState<string | null>(null);
  const [sightingText, setSightingText] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    const newReport: MissingPersonReport = {
      id: `mis-${Date.now()}`,
      timestamp: 'Just now',
      fullName,
      age,
      gender,
      lastSeenLocation,
      lastSeenTime,
      clothingDescription,
      contactNumber,
      status: 'Searching',
      sightingsCount: 0,
    };

    onAddReport(newReport);
    setShowModal(false);
    setFullName('');
  };

  const handleSightingSubmit = (id: string) => {
    if (!sightingText) return;
    onAddSighting(id, sightingText);
    setSelectedPersonForSighting(null);
    setSightingText('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Privacy-Preserving Family Reunification
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                Missing Persons Coordination & Verified Sightings
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Ethical disaster reunification engine. Protects citizen biometric privacy by avoiding invasive facial recognition;
              instead cross-references <strong>clothing signatures, age cohorts, last-seen zones, and verified responder sighting logs</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>File Missing Person Report</span>
          </button>
        </div>
      </div>

      {/* Grid of Missing Persons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((person) => (
          <div
            key={person.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-xs space-y-3 shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{person.fullName}</h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Age: {person.age} • Gender: {person.gender} • Reported: {person.timestamp}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  person.status === 'Reunited'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : person.status === 'Sighted'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {person.status} ({person.sightingsCount} Sightings)
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Last Seen:</strong> {person.lastSeenLocation} ({person.lastSeenTime})
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Clothing / Appearance:</strong> {person.clothingDescription}
                </span>
              </div>
            </div>

            {selectedPersonForSighting === person.id ? (
              <div className="bg-slate-950 p-3 rounded-lg border border-sky-900/60 space-y-2">
                <label className="text-[10px] font-bold text-sky-300 uppercase block">
                  Submit Verified Sighting Location & Notes
                </label>
                <textarea
                  rows={2}
                  value={sightingText}
                  onChange={(e) => setSightingText(e.target.value)}
                  placeholder="e.g. Sighted at Camp Krishna intake desk receiving dry ration..."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSightingSubmit(person.id)}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded text-xs"
                  >
                    Confirm Sighting
                  </button>
                  <button
                    onClick={() => setSelectedPersonForSighting(null)}
                    className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {person.contactNumber}
                </span>

                <button
                  onClick={() => setSelectedPersonForSighting(person.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Report Sighting</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                Report Missing Citizen
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name of Missing Person</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Last Known Location / Landmark</label>
                <input
                  type="text"
                  required
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Last Known Time / Circumstance</label>
                <input
                  type="text"
                  required
                  value={lastSeenTime}
                  onChange={(e) => setLastSeenTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Clothing & Appearance Details</label>
                <textarea
                  rows={2}
                  required
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 resize-none"
                  placeholder="Color of shirt, footwear, accessories, bags..."
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Family Emergency Contact Phone</label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg mt-2"
              >
                File Dossier for Field Responders
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
