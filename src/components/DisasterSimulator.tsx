import React, { useState } from 'react';
import {
  CommInfrastructureNode,
  RoadEdge,
  CommLink,
} from '../types';
import {
  Sliders,
  Flame,
  RotateCcw,
  Radio,
  Compass,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DisasterSimulatorProps {
  infraNodes: CommInfrastructureNode[];
  roads: RoadEdge[];
  links: CommLink[];
  onToggleNode: (id: string) => void;
  onToggleRoad: (id: string) => void;
  onRunDemoScenario: () => void;
  onResetAll: () => void;
  isDisasterActive: boolean;
}

export const DisasterSimulator: React.FC<DisasterSimulatorProps> = ({
  infraNodes,
  roads,
  links,
  onToggleNode,
  onToggleRoad,
  onRunDemoScenario,
  onResetAll,
  isDisasterActive,
}) => {
  const [floodStage, setFloodStage] = useState<number>(isDisasterActive ? 25.4 : 18.2);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Interactive Simulation Lab
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-400" />
                Disaster Conditions & Infrastructure Stress Laboratory
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Allows judges and emergency planners to selectively disable telecom towers, flood bridges, and simulate
              complex cascading failures to observe how SignalMesh and ResourceMatch adapt in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRunDemoScenario}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-xl flex items-center space-x-2 active:scale-95 ring-1 ring-red-400/40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Automated Killer Demo Sequence</span>
            </button>

            <button
              onClick={onResetAll}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Toggles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Telecom Towers & Radio Stations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Telecom Infrastructure Toggles</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Toggle</span>
          </div>

          <div className="space-y-2.5">
            {infraNodes.map((node) => (
              <div
                key={node.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{node.name}</h4>
                  <span className="text-[10px] text-slate-400">
                    Type: {node.type.replace('_', ' ')} • Range: {node.rangeKm}km • Battery: {node.batteryBackupHours}h
                  </span>
                </div>

                <button
                  onClick={() => onToggleNode(node.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    node.isOperational
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                  }`}
                >
                  {node.isOperational ? 'Online ✅ (Click to Kill)' : 'Failed ❌ (Click to Restore)'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Road Network & Bridge Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Road Network & Bridge Submersion</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Toggle</span>
          </div>

          <div className="space-y-2.5">
            {roads.slice(0, 6).map((road) => {
              const isClosed = road.condition === 'Submerged_Closed';

              return (
                <div
                  key={road.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{road.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      Distance: {road.distanceKm}km • Depth: {road.waterDepthCm}cm
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleRoad(road.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isClosed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                    }`}
                  >
                    {!isClosed ? 'Clear Road (Click to Submerge)' : 'Flooded (Click to Drain)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* River Basin Flood Stage Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Krishna River Basin Hydrological Discharge Stage (Prakasam Barrage)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust water level to simulate rising flood crest and observe dynamic isolation triggers.
            </p>
          </div>
          <span className="text-2xl font-black font-mono text-amber-400">
            {floodStage.toFixed(1)} <span className="text-sm text-slate-400">Meters</span>
          </span>
        </div>

        <input
          type="range"
          min="15.0"
          max="28.0"
          step="0.2"
          value={floodStage}
          onChange={(e) => setFloodStage(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
        />

        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>15.0m Normal Flow</span>
          <span>20.0m Warning Level</span>
          <span>24.0m Danger Crest</span>
          <span className="text-red-400 font-bold">28.0m Catastrophic Breach</span>
        </div>
      </div>
    </div>
  );
};
