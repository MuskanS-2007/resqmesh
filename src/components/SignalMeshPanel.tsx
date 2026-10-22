import React, { useState } from 'react';
import {
  SignalMeshResult,
} from '../utils/signalMeshEngine';
import {
  CommunityNode,
  CommInfrastructureNode,
  CommLink,
} from '../types';
import { SignalMeshGraph } from './SignalMeshGraph';
import {
  Radio,
  Wifi,
  MessageSquare,
  Users,
  AlertTriangle,
  Send,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface SignalMeshPanelProps {
  meshResult: SignalMeshResult;
  communities: CommunityNode[];
  infraNodes: CommInfrastructureNode[];
  links: CommLink[];
  onToggleLink: (linkId: string) => void;
  onToggleNode: (nodeId: string) => void;
  onAuthorizeRelay: (recId: string, fromId: string, toId: string) => void;
}

export const SignalMeshPanel: React.FC<SignalMeshPanelProps> = ({
  meshResult,
  communities,
  infraNodes,
  links,
  onToggleLink,
  onToggleNode,
  onAuthorizeRelay,
}) => {
  const [broadcastMessage, setBroadcastMessage] = useState(
    '⚠️ ADVISORY [APSDMA]: Krishna river flood crest reaching 25.4m. Evacuate Zone C lowlands to nearest designated relief camp.'
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('village-8');

  const handleSimulateBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 5000);
    }, 1200);
  };

  const selectedVillage = communities.find((v) => v.id === selectedNodeId);
  const selectedStatus = selectedVillage ? meshResult.villageStatusMap.get(selectedVillage.id) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Problem Statement Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Core Signature Innovation
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                SignalMesh — Emergency Message Survivability Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              When standard cellular and fiber infrastructure fail during disasters, SignalMesh dynamically computes
              multi-hop message delivery topologies across <strong>Cellular SMS</strong>, <strong>HF/VHF Community Radio</strong>, and
              <strong> Volunteer Physical Relays</strong>, recommending actionable routing interventions before lives are lost.
            </p>
          </div>

          {/* Survivability Gauge Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                MESSAGE REACHABILITY
              </span>
              <div
                className={`text-3xl font-black font-mono ${
                  meshResult.coveragePercent >= 90
                    ? 'text-emerald-400'
                    : meshResult.coveragePercent >= 70
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {meshResult.coveragePercent}%
              </div>
              <span className="text-[10px] text-slate-400">
                {meshResult.reachableCount} / {meshResult.totalVillages} Communities Covered
              </span>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                AT-RISK POPULATION
              </span>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {meshResult.unreachableVillages
                  .reduce((acc, v) => acc + v.population, 0)
                  .toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Potentially Unreachable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Live Network Topology Graph & Reachability Paths
            </h3>
            <p className="text-xs text-slate-400">
              Interactive SVG Graph. Click any <strong>link or tower</strong> to simulate its failure, or click a <strong>village</strong> to trace its delivery path.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <span className="w-2.5 h-0.5 bg-emerald-400" />
              <span className="text-slate-300">Fiber ({meshResult.channelBreakdown.fiberInternet})</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <span className="w-2.5 h-0.5 bg-cyan-400" />
              <span className="text-slate-300">Cell SMS ({meshResult.channelBreakdown.cellularSms})</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <span className="w-2.5 h-0.5 bg-amber-400" />
              <span className="text-slate-300">Radio ({meshResult.channelBreakdown.radioBroadcast})</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <span className="w-2.5 h-0.5 bg-purple-400" />
              <span className="text-slate-300">Volunteer Relay ({meshResult.channelBreakdown.volunteerRelay})</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300">Cutoff ({meshResult.channelBreakdown.isolated})</span>
            </div>
          </div>
        </div>

        <SignalMeshGraph
          communities={communities}
          infraNodes={infraNodes}
          links={links}
          onToggleLink={onToggleLink}
          onToggleNode={onToggleNode}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
        />
      </div>

      {/* Grid: Broadcast Simulator + Path Tracer + Decision Support Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Geo-Targeted Emergency Alert Dispatch */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Send className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Geo-Targeted Emergency Broadcast</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Broadcast authority advisory. SignalMesh routes this payload across all surviving transmission edges.
            </p>

            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono resize-none mb-3"
            />

            <div className="space-y-1.5 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Fiber Reach:</span>
                <span className="text-emerald-400 font-bold">{meshResult.channelBreakdown.fiberInternet} villages</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>SMS Fallback:</span>
                <span className="text-cyan-400 font-bold">+{meshResult.channelBreakdown.cellularSms} villages</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Radio Broadcast:</span>
                <span className="text-amber-400 font-bold">+{meshResult.channelBreakdown.radioBroadcast} villages</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Volunteer Mesh:</span>
                <span className="text-purple-400 font-bold">+{meshResult.channelBreakdown.volunteerRelay} villages</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-300 font-bold">
                <span>Total Modeled Reach:</span>
                <span className="text-white">{meshResult.coveragePercent}% of territory</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSimulateBroadcast}
              disabled={isBroadcasting}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Simulating Network Hop Ingestion...</span>
                </>
              ) : broadcastSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Broadcast Dispatched to Surviving Nodes!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simulate Multi-Network Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Col 2: Selected Node Hop Tracer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Algorithmic Delivery Path Tracer</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Inspect how messages reach a specific community after graph recalculation.
          </p>

          {selectedVillage ? (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedVillage.name}</h4>
                  <span className="text-[10px] text-slate-400">Pop: {selectedVillage.population.toLocaleString()} | {selectedVillage.zone}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                      selectedStatus?.status === 'Isolated_No_Signal'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : selectedStatus?.status === 'Volunteer_Relay'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : selectedStatus?.status === 'Radio_Broadcast'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : selectedStatus?.status === 'SMS_Only'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {selectedStatus?.status.replace(/_/g, ' ') || 'Connected'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Modeled Transmission Route:
                </span>
                {selectedStatus && selectedStatus.path.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedStatus.path.map((hop, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center border border-slate-700">
                          {idx + 1}
                        </span>
                        <span className={`font-mono ${idx === selectedStatus.path.length - 1 ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                          {hop}
                        </span>
                        {idx < selectedStatus.path.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-950/60 border border-red-800 p-2.5 rounded text-red-300 text-xs">
                    No active link sequence found. Community is in a zero-coverage blackout zone!
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Active Channel Protocol:</span>
                  <span className="text-cyan-400 font-semibold">{selectedStatus?.activeChannel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Packet Traversal Latency:</span>
                  <span className="text-slate-200 font-mono">
                    {selectedStatus?.activeChannel === 'Fiber_Internet' ? '14 ms' : selectedStatus?.activeChannel === 'Cellular_SMS' ? '1,840 ms' : 'Voice broadcast loop'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select a node from the graph to inspect path hops.</p>
          )}
        </div>

        {/* Col 3: Alternative Path Decision Support Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Path Restoration Recommendations</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Algorithmic decision-support recommendations to reconnect disconnected communities.
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {meshResult.recommendations.length > 0 ? (
              meshResult.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950 border border-amber-900/50 hover:border-amber-500/50 p-3 rounded-lg text-xs space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-red-400 font-bold block">{rec.currentStatus}</span>
                      <h4 className="font-bold text-white text-sm">{rec.targetVillageName}</h4>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                      +{rec.projectedRestorationPercent}% Coverage Gain
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Action:</strong> {rec.recommendedAction}
                  </p>

                  <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 space-y-0.5">
                    <div>
                      <strong className="text-slate-300">Staging Node:</strong> {rec.deployFromLocation}
                    </div>
                    <div>
                      <strong className="text-slate-300">Relay Asset:</strong> {rec.relayVolunteer}
                    </div>
                    <div>
                      <strong className="text-slate-300">Gear:</strong> {rec.requiredEquipment}
                    </div>
                  </div>

                  <button
                    onClick={() => onAuthorizeRelay(rec.id, rec.deployFromLocation, rec.targetVillageId)}
                    className="w-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold py-1.5 px-3 rounded text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Authorize Tactical Relay Dispatch</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-lg text-center text-emerald-300 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <strong className="block text-sm">Optimal Message Coverage</strong>
                All 12 communities currently maintain active communication paths through surviving networks!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
