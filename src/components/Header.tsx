import React from 'react';
import {
  ShieldAlert,
  Radio,
  Wifi,
  WifiOff,
  Flame,
  RotateCcw,
  Activity,
  Layers,
  MapPin,
  Truck,
  Users,
  ShieldCheck,
  Sliders,
  Camera,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulatedOffline: boolean;
  toggleOfflineSimulation: () => void;
  coveragePercent: number;
  isolatedCount: number;
  onSimulateDisaster: () => void;
  onResetDisaster: () => void;
  isDisasterActive: boolean;
  pendingOfflineCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSimulatedOffline,
  toggleOfflineSimulation,
  coveragePercent,
  isolatedCount,
  onSimulateDisaster,
  onResetDisaster,
  isDisasterActive,
  pendingOfflineCount,
}) => {
  const tabs = [
    { id: 'command-map', label: 'Command Map', icon: MapPin },
    { id: 'signal-mesh', label: 'SignalMesh Engine', icon: Radio, badge: `${coveragePercent}%` },
    { id: 'citizen-sos', label: 'Citizen SOS (PWA)', icon: ShieldAlert, alert: pendingOfflineCount > 0 },
    { id: 'damage-reports', label: 'AI Damage & Hazards', icon: Camera },
    { id: 'resource-match', label: 'ResourceMatch Logistics', icon: Truck },
    { id: 'volunteers', label: 'Volunteers & Relays', icon: Users },
    { id: 'missing-persons', label: 'Missing Persons', icon: Compass },
    { id: 'resilience', label: 'Resilience Radar', icon: ShieldCheck },
    { id: 'simulator', label: 'Disaster Simulator', icon: Sliders },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
      {/* Top Critical Status Ticker */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 px-4 py-1.5 border-b border-red-900/50 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-red-300 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase text-[11px] text-red-400">SURAKSHIT BHARAT • TRACK A:</span>
          <span className="text-slate-200">
            {isDisasterActive
              ? 'KRISHNA RIVER FLASH FLOOD (PHASE 3) — TOWER T3 DOWN • 3 BRIDGES SUBMERGED • MULTI-HOP RELAY ACTIVE'
              : 'BASELINE STANDBY — MONITORING MONSOON RUNOFF & TELECOM HEALTH (VIJAYAWADA SECTOR)'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sys Clock: <strong className="text-slate-100 font-mono">11:42 AM IST</strong></span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
            <span>Survivability:</span>
            <span className={`font-mono font-bold ${coveragePercent > 85 ? 'text-emerald-400' : coveragePercent > 65 ? 'text-amber-400' : 'text-red-400'}`}>
              {coveragePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-2.5 rounded-xl shadow-lg shadow-red-900/30 ring-1 ring-white/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                ResQ<span className="text-red-500">Mesh</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                v2.4 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Disaster Coordination, SignalMesh Survivability & Supply Matching
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Offline Mode Toggle Button */}
          <button
            onClick={toggleOfflineSimulation}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle simulated network disconnection to test Offline PWA SOS caching"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Simulated Offline Mode <strong className="text-white">(ON)</strong></span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Network: <strong className="text-emerald-400">Live Online</strong></span>
              </>
            )}
          </button>

          {/* Pending Offline SOS Badge */}
          {pendingOfflineCount > 0 && (
            <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <Layers className="w-3.5 h-3.5" />
              <span>{pendingOfflineCount} SOS Queued Offline</span>
            </div>
          )}

          {/* Disaster Surge Simulator Button */}
          {!isDisasterActive ? (
            <button
              onClick={onSimulateDisaster}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-red-950/50 transition-all active:scale-95 ring-1 ring-red-400/30"
            >
              <Flame className="w-4 h-4 animate-bounce" />
              <span>Simulate Disaster Surge</span>
            </button>
          ) : (
            <button
              onClick={onResetDisaster}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reset to Baseline</span>
            </button>
          )}

          {/* Isolation Warning Pill */}
          {isolatedCount > 0 && (
            <div className="flex items-center space-x-1.5 bg-red-950/80 text-red-300 border border-red-700/80 px-2.5 py-1.5 rounded-lg text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{isolatedCount} Isolated Communities</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar border-t border-slate-800/80">
        <nav className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-red-500/30 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
