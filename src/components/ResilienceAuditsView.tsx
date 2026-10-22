import React, { useState } from 'react';
import { CommunityNode } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Radio,
  Compass,
  Home,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ResilienceAuditsViewProps {
  communities: CommunityNode[];
}

export const ResilienceAuditsView: React.FC<ResilienceAuditsViewProps> = ({ communities }) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string>('village-4'); // Krishna Lanka

  const selectedVillage = communities.find((v) => v.id === selectedVillageId) || communities[0];

  const sortedByVulnerability = [...communities].sort((a, b) => a.resilienceScore - b.resilienceScore);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Pre-Disaster Preparedness & SPOF Detection
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Community Disaster Resilience Score & Vulnerability Audit
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              ResQMesh is not useful <em>only during disasters</em>. Disaster authorities utilize this pre-disaster intelligence layer
              to evaluate <strong>single points of failure (SPOFs)</strong>, telecom redundancy gaps, and transit choke points before disaster strikes.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-center">
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">MOST VULNERABLE</span>
              <span className="text-lg font-bold text-red-400 font-mono">Vuyyuru (39/100)</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AVERAGE RESILIENCE</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {Math.round(communities.reduce((acc, c) => acc + c.resilienceScore, 0) / communities.length)}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Village Ranking Table & Detailed Diagnostic Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Vulnerability Rankings Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Community Resilience Ranks</h3>
            <span className="text-[10px] text-slate-400 font-mono">Sorted by Risk</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {sortedByVulnerability.map((v, idx) => {
              const isSelected = selectedVillageId === v.id;
              const isCritical = v.resilienceScore < 50;

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVillageId(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.name}</h4>
                      <span className="text-[10px] text-slate-400">{v.zone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black font-mono block ${
                        isCritical ? 'text-red-400' : v.resilienceScore < 70 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {v.resilienceScore}/100
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        isCritical ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCritical ? 'High Vulnerability' : 'Moderate'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2 & 3: Detailed Village Diagnostic Dossier */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                VULNERABILITY AUDIT DOSSIER
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedVillage.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Population: <strong>{selectedVillage.population.toLocaleString()}</strong> • Flood Hazard Zone: <strong>{selectedVillage.floodRisk}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">COMPOSITE RESILIENCE</span>
              <span className="text-3xl font-black text-amber-400 font-mono">
                {selectedVillage.resilienceScore}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </span>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Comm Redundancy */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Telecom Redundancy
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {selectedVillage.resilienceBreakdown.commRedundancy}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full"
                  style={{ width: `${selectedVillage.resilienceBreakdown.commRedundancy}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Independent communication pathways connecting community to the central emergency network.
              </p>
            </div>

            {/* 2. Road Accessibility */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Road & Egress Viability
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedVillage.resilienceBreakdown.roadAccessibility}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${selectedVillage.resilienceBreakdown.roadAccessibility}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Number of alternate high-elevation evacuation corridors above 100-year flood levels.
              </p>
            </div>

            {/* 3. Resource Proximity */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-400" />
                  Supply Depot Proximity
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {selectedVillage.resilienceBreakdown.resourceProximity}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${selectedVillage.resilienceBreakdown.resourceProximity}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Distance to nearest NDRF warehouse: <strong>{selectedVillage.nearestReliefCenterKm} km</strong> transit radius.
              </p>
            </div>

            {/* 4. Shelter Access */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Elevated Shelter Capacity
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {selectedVillage.resilienceBreakdown.shelterAccess}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full"
                  style={{ width: `${selectedVillage.resilienceBreakdown.shelterAccess}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Adequacy of concrete multi-story cyclone/flood relief centers per capita.
              </p>
            </div>
          </div>

          {/* Single Point of Failure (SPOF) Callout */}
          <div className="bg-red-950/40 border border-red-700/80 p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Identified Single Point of Failure (SPOF):</span>
            </div>
            <p className="text-red-200 text-xs leading-relaxed bg-red-950/60 p-2.5 rounded border border-red-900/60 font-mono">
              "{selectedVillage.resilienceBreakdown.spofVulnerability}"
            </p>
          </div>

          {/* Actionable Pre-Disaster Mitigation Recommendations */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              RECOMMENDED PRE-DISASTER INTERVENTIONS
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Pre-position VHF HAM radio transceiver pack with local village council before storm arrival.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Deploy elevated generator backup at local water purification borehole.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Stockpile 300 emergency life vests and 2 shallow-draft inflatable rafts at designated high school shelter.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
