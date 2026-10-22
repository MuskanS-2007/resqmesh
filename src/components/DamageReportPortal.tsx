import React, { useState } from 'react';
import { DamageIncidentReport } from '../types';
import {
  Camera,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface DamageReportPortalProps {
  reports: DamageIncidentReport[];
  onAddReport: (report: DamageIncidentReport) => void;
}

export const DamageReportPortal: React.FC<DamageReportPortalProps> = ({
  reports,
  onAddReport,
}) => {
  const [category, setCategory] = useState<DamageIncidentReport['category']>('Flooded Road');
  const [locationName, setLocationName] = useState('Prakasam Barrage Approach Underpass');
  const [description, setDescription] = useState('Heavy canal backflow, water level around 3.5ft, passenger cars stalled.');
  const [reporterName, setReporterName] = useState('Civil Defense Warden Murthy');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
  );
  const [isClassifying, setIsClassifying] = useState(false);

  // Simulated AI Vision inference
  const aiVisionClassifications: Record<DamageIncidentReport['category'], { label: string; conf: number }> = {
    'Flooded Road': { label: 'Severe Road Inundation / Inpassable for standard transit', conf: 0.94 },
    'Bridge Structural Damage': { label: 'Culvert Abutment Scour / Structural Integrity Warning', conf: 0.91 },
    'Fallen Tree / Powerline': { label: 'Physical Carriageway Blockage + 33kV Live Wire Hazard', conf: 0.96 },
    'Landslide': { label: 'Debris Flow / Complete Hillside Slip Cutoff', conf: 0.88 },
    'Building Collapse': { label: 'Partial Masonry Failure / Structural Collapse Hazard', conf: 0.95 },
  };

  const handleSimulatePhotoChange = (cat: DamageIncidentReport['category']) => {
    setCategory(cat);
    setIsClassifying(true);
    setTimeout(() => {
      setIsClassifying(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ai = aiVisionClassifications[category];

    const newReport: DamageIncidentReport = {
      id: `inc-${Date.now()}`,
      timestamp: 'Just now',
      reporterName,
      category,
      locationName,
      coordinates: [16.5100 + (Math.random() - 0.5) * 0.02, 80.6200 + (Math.random() - 0.5) * 0.02],
      description,
      aiClassification: ai.label,
      aiConfidence: ai.conf,
      photoUrl: selectedPhoto,
      reportedCount: 1,
      verified: true,
    };

    onAddReport(newReport);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                AI Incident Intelligence & Duplicate Clustering
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Damage Assessment & Crowd-Sourced Hazard Ingestion
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Citizens submit field photos of flooded roads and collapsed culverts. ResQMesh runs <strong>AI assistance classification</strong> and
              automatically <strong>clusters duplicate crowd reports</strong> within proximity thresholds to keep the command dashboard clean.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Reporting Form & Clustered Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              Upload Incident Report
            </h3>
            <p className="text-xs text-slate-400">Field observation with AI classification preview.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hazard Category</label>
              <select
                value={category}
                onChange={(e) => handleSimulatePhotoChange(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="Flooded Road">Flooded Road</option>
                <option value="Bridge Structural Damage">Bridge Structural Damage</option>
                <option value="Fallen Tree / Powerline">Fallen Tree / Live Powerline</option>
                <option value="Landslide">Landslide / Embankment Slip</option>
                <option value="Building Collapse">Building Structural Failure</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Location / Road Stretch</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Reporter Name / Role</label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Visual Observation Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 resize-none"
              />
            </div>

            {/* AI Classifier Box */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Computer Vision Inference
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {Math.round(aiVisionClassifications[category].conf * 100)}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-200 font-mono">
                {aiVisionClassifications[category].label}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs shadow-lg"
            >
              Submit Verified Hazard Report
            </button>
          </form>
        </div>

        {/* Clustered Reports Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Duplicate Incident Clustering Engine
              </h3>
              <p className="text-xs text-slate-400">
                Multiple citizen reports regarding the same bridge or highway segment are clustered into consolidated items.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {reports.length} Consolidated Hazards
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm">{rep.category}</h4>
                      <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40">
                        {rep.reportedCount > 1 ? `Reported by ${rep.reportedCount} citizens (Clustered)` : 'Single Report'}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" /> {rep.locationName} • {rep.timestamp}
                    </span>
                  </div>

                  <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                    AI Verified ({Math.round(rep.aiConfidence * 100)}%)
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800/80">
                  {rep.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>AI Tag: <strong className="text-slate-300 font-mono">{rep.aiClassification}</strong></span>
                  <span>Primary Reporter: <strong>{rep.reporterName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
