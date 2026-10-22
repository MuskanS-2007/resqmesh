import React, { useState } from 'react';
import { Volunteer } from '../types';
import {
  Users,
  Radio,
  HeartPulse,
  Truck,
  Anchor,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Shield,
  Phone,
} from 'lucide-react';

interface VolunteersViewProps {
  volunteers: Volunteer[];
  onAddVolunteer: (vol: Volunteer) => void;
  onUpdateStatus: (id: string, status: Volunteer['status']) => void;
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({
  volunteers,
  onAddVolunteer,
  onUpdateStatus,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [name, setName] = useState('');
  const [zone, setZone] = useState('Zone Central South (Patamata)');
  const [phone, setPhone] = useState('+91 98480 ');
  const [vehicleType, setVehicleType] = useState<Volunteer['vehicleType']>('Motorcycle');
  const [vehicleCapacityKg, setVehicleCapacityKg] = useState(80);
  const [skills, setSkills] = useState<Volunteer['skills']>(['First Aid']);

  const availableSkills: Volunteer['skills'][number][] = [
    'First Aid',
    'Water Rescue',
    'HAM Radio',
    'Doctor/Paramedic',
    'Logistics',
    'Boat Pilot',
  ];

  const handleToggleSkill = (skill: Volunteer['skills'][number]) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newVol: Volunteer = {
      id: `vol-${Date.now()}`,
      name,
      zone,
      phone,
      coordinates: [16.5100 + (Math.random() - 0.5) * 0.04, 80.6400 + (Math.random() - 0.5) * 0.04],
      skills,
      vehicleType,
      vehicleCapacityKg,
      status: 'Available',
    };

    onAddVolunteer(newVol);
    setShowRegisterModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Community Force Multiplier
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Volunteer Responder Fleet & Tactical Comm Relays
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Civilian volunteers, licensed amateur HAM radio operators, and specialized boat pilots registered for tactical emergency dispatch.
              Volunteers bridge communication blackouts by establishing mobile packet relays.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register as Volunteer</span>
          </button>
        </div>
      </div>

      {/* Volunteer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((vol) => (
          <div
            key={vol.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-xs space-y-3 shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{vol.name}</h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-purple-400" /> {vol.zone}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  vol.status === 'Available'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : vol.status === 'Relaying_Comm'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {vol.status.replace('_', ' ')}
              </span>
            </div>

            {/* Vehicle & Capacity */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Transport Capability</span>
                <span className="text-slate-200 font-semibold">{vol.vehicleType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Payload Limit</span>
                <span className="font-mono text-cyan-400 font-bold">{vol.vehicleCapacityKg} kg</span>
              </div>
            </div>

            {/* Skills Badges */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">Certified Skills</span>
              <div className="flex flex-wrap gap-1">
                {vol.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-purple-950/60 border border-purple-800 text-purple-300 px-2 py-0.5 rounded text-[10px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" /> {vol.phone}
              </span>

              <div className="flex items-center space-x-1">
                {vol.status === 'Available' ? (
                  <button
                    onClick={() => onUpdateStatus(vol.id, 'Relaying_Comm')}
                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-2 py-1 rounded text-[10px] font-semibold border border-purple-500/30"
                  >
                    Assign Comm Relay
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(vol.id, 'Available')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] border border-slate-700"
                  >
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl text-xs space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Register as Emergency Responder
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Babu"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Operating Zone / Neighborhood</label>
                <input
                  type="text"
                  required
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="4x4 Tractor/Jeep">4x4 Tractor / Jeep</option>
                    <option value="Inflatable Rescue Boat">Inflatable Rescue Boat</option>
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="None (Foot)">Foot Patrol</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cargo Limit (Kg)</label>
                  <input
                    type="number"
                    value={vehicleCapacityKg}
                    onChange={(e) => setVehicleCapacityKg(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Skills & Certifications</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableSkills.map((sk) => {
                    const isChecked = skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => handleToggleSkill(sk)}
                        className={`p-2 rounded text-left border text-[11px] ${
                          isChecked
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {isChecked ? '✓ ' : ''}{sk}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg mt-2"
              >
                Confirm Volunteer Onboarding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
