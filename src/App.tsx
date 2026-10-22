import React, { useState, useEffect } from 'react';
import {
  INITIAL_COMMUNITIES,
  INITIAL_INFRASTRUCTURE,
  INITIAL_COMM_LINKS,
  INITIAL_ROADS,
  INITIAL_RELIEF_CAMPS,
  INITIAL_WAREHOUSES,
  INITIAL_VOLUNTEERS,
  INITIAL_SOS_REQUESTS,
  INITIAL_DAMAGE_REPORTS,
  INITIAL_MISSING_PERSONS,
} from './data/disasterScenario';
import {
  CommunityNode,
  CommInfrastructureNode,
  CommLink,
  RoadEdge,
  ReliefCamp,
  ResourceWarehouse,
  Volunteer,
  SosRequest,
  ResourceAllocationPlan,
  DamageIncidentReport,
  MissingPersonReport,
} from './types';
import {
  calculateSignalMeshSurvivability,
  SignalMeshResult,
} from './utils/signalMeshEngine';
import {
  setSimulatedOffline,
  getOfflineSosQueue,
  clearOfflineSosQueue,
} from './utils/offlineQueue';

import { Header } from './components/Header';
import { CommandMap } from './components/CommandMap';
import { SignalMeshPanel } from './components/SignalMeshPanel';
import { CitizenSosPortal } from './components/CitizenSosPortal';
import { ResourceMatchView } from './components/ResourceMatchView';
import { VolunteersView } from './components/VolunteersView';
import { ResilienceAuditsView } from './components/ResilienceAuditsView';
import { DisasterSimulator } from './components/DisasterSimulator';
import { DamageReportPortal } from './components/DamageReportPortal';
import { MissingPersonsView } from './components/MissingPersonsView';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('command-map');

  // Core Data State
  const [communities, setCommunities] = useState<CommunityNode[]>(INITIAL_COMMUNITIES);
  const [infraNodes, setInfraNodes] = useState<CommInfrastructureNode[]>(INITIAL_INFRASTRUCTURE);
  const [links, setLinks] = useState<CommLink[]>(INITIAL_COMM_LINKS);
  const [roads, setRoads] = useState<RoadEdge[]>(INITIAL_ROADS);
  const [reliefCamps, setReliefCamps] = useState<ReliefCamp[]>(INITIAL_RELIEF_CAMPS);
  const [warehouses, setWarehouses] = useState<ResourceWarehouse[]>(INITIAL_WAREHOUSES);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [sosRequests, setSosRequests] = useState<SosRequest[]>(INITIAL_SOS_REQUESTS);
  const [damageReports, setDamageReports] = useState<DamageIncidentReport[]>(INITIAL_DAMAGE_REPORTS);
  const [missingPersons, setMissingPersons] = useState<MissingPersonReport[]>(INITIAL_MISSING_PERSONS);

  // Simulation & Offline State
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isDisasterActive, setIsDisasterActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Run SignalMesh Calculation
  const meshResult: SignalMeshResult = calculateSignalMeshSurvivability(
    communities,
    infraNodes,
    links
  );

  // Synchronize Community Comm & Isolation status with SignalMesh result
  useEffect(() => {
    setCommunities((prev) =>
      prev.map((v) => {
        const info = meshResult.villageStatusMap.get(v.id);
        const roadConnected = roads.some(
          (r) => (r.fromNodeId === v.id || r.toNodeId === v.id) && r.condition !== 'Submerged_Closed'
        );

        const isCommDown = !info || info.status === 'Isolated_No_Signal';
        const isRoadDown = !roadConnected;

        return {
          ...v,
          commStatus: info ? info.status : 'Isolated_No_Signal',
          commPath: info ? info.path : [],
          activeChannel: info ? info.activeChannel : 'None',
          isCommIsolated: isCommDown,
          isPhysicallyIsolated: isRoadDown && isCommDown,
        };
      })
    );
  }, [infraNodes, links, roads]);

  // Check offline queue on load and setup sync listeners
  useEffect(() => {
    const checkQueue = () => {
      const q = getOfflineSosQueue();
      setPendingOfflineCount(q.length);
    };

    checkQueue();

    const handleOnline = () => {
      syncOfflineQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const syncOfflineQueue = () => {
    const queue = getOfflineSosQueue();
    if (queue.length > 0) {
      const syncedItems: SosRequest[] = queue.map((item) => ({
        ...item,
        isOfflineSynced: true,
        timestamp: 'Just synced (Offline PWA)',
      }));

      setSosRequests((prev) => [...syncedItems, ...prev]);
      clearOfflineSosQueue();
      setPendingOfflineCount(0);
      showToast(`⚡ Connectivity Restored: ${syncedItems.length} cached SOS requests synchronized to Command HQ!`);
    }
  };

  const toggleOfflineSimulation = () => {
    const next = !isSimulatedOffline;
    setIsSimulatedOfflineState(next);
    setSimulatedOffline(next);

    if (!next) {
      // Reconnected -> sync queue!
      syncOfflineQueue();
    } else {
      showToast('📴 Simulated Offline Mode Active: Testing PWA local cache ingestion.');
    }
  };

  // Automated "Killer Demo" Disaster Scenario Execution
  const handleSimulateDisaster = () => {
    setIsDisasterActive(true);

    // 1. Fail Tower T3
    setInfraNodes((prev) =>
      prev.map((n) => (n.id === 'node-t3' ? { ...n, isOperational: false } : n))
    );

    // 2. Sever Fiber and SMS links to eastern villages
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id.includes('t3')) return { ...l, status: 'Failed' };
        return l;
      })
    );

    // 3. Submerge Kanuru Main Feeder Road (Route A)
    setRoads((prev) =>
      prev.map((r) =>
        r.id === 'road-v7-v8'
          ? { ...r, condition: 'Submerged_Closed', waterDepthCm: 110 }
          : r
      )
    );

    // 4. Update community trapped headcounts
    setCommunities((prev) =>
      prev.map((v) =>
        v.id === 'village-8' // Kanuru
          ? { ...v, floodRisk: 'Severe', trappedPersons: 48, waterRequests: 180, roadStatus: 'Submerged_Closed' }
          : v
      )
    );

    showToast('🌊 DISASTER SIMULATION TRIGGERED: Tower T3 offline • Feeder Road A Submerged • 3 Villages Cut Off!');
  };

  const handleResetDisaster = () => {
    setIsDisasterActive(false);
    setInfraNodes(INITIAL_INFRASTRUCTURE);
    setLinks(INITIAL_COMM_LINKS);
    setRoads(INITIAL_ROADS);
    setCommunities(INITIAL_COMMUNITIES);
    showToast('🔄 Scenario reset to normal baseline conditions.');
  };

  // Toggle individual infra node
  const handleToggleNode = (nodeId: string) => {
    setInfraNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, isOperational: !n.isOperational } : n))
    );
  };

  // Toggle individual comm link
  const handleToggleLink = (linkId: string) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId
          ? { ...l, status: l.status === 'Active' ? 'Failed' : 'Active' }
          : l
      )
    );
  };

  // Toggle individual road
  const handleToggleRoad = (roadId: string) => {
    setRoads((prev) =>
      prev.map((r) =>
        r.id === roadId
          ? {
              ...r,
              condition: r.condition === 'Clear' ? 'Submerged_Closed' : 'Clear',
              waterDepthCm: r.condition === 'Clear' ? 95 : 0,
            }
          : r
      )
    );
  };

  // Authorize Tactical Volunteer Relay deployment (Restores path)
  const handleAuthorizeRelay = (recId: string, fromId: string, toVillageId: string) => {
    setLinks((prev) => [
      ...prev,
      {
        id: `link-tactical-relay-${toVillageId}-${Date.now()}`,
        sourceId: 'village-6', // Patamata
        targetId: toVillageId,
        channel: 'Volunteer_Mesh_Relay',
        status: 'Active',
        reliability: 0.88,
        description: 'Authorized Tactical HAM radio & motorcycle relay',
      },
    ]);

    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === 'vol-3' // Rajesh Kumar HAM operator
          ? { ...v, status: 'Relaying_Comm', currentMission: `Packet courier relay to ${toVillageId}` }
          : v
      )
    );

    showToast(`📡 Tactical Relay Deployed: Re-established communication with ${toVillageId} via HAM Mesh!`);
  };

  // Add new SOS request
  const handleAddSos = (newSos: SosRequest) => {
    setSosRequests((prev) => [newSos, ...prev]);
    showToast(`🆘 New SOS Triaged: ${newSos.category} at ${newSos.locationName} (Score: ${newSos.priorityScore}/100)`);
  };

  // Execute supply dispatch plan
  const handleDispatchSupplies = (plan: ResourceAllocationPlan) => {
    setWarehouses((prev) =>
      prev.map((wh) => {
        if (wh.id === plan.sourceWarehouseId) {
          return {
            ...wh,
            stock: {
              ...wh.stock,
              waterBottles: Math.max(0, wh.stock.waterBottles - 150),
              medicineKits: Math.max(0, wh.stock.medicineKits - 20),
            },
          };
        }
        return wh;
      })
    );

    setReliefCamps((prev) =>
      prev.map((c) => {
        if (c.id === plan.targetCampId) {
          return {
            ...c,
            supplies: {
              ...c.supplies,
              waterBottles: c.supplies.waterBottles + 150,
              medicineKits: c.supplies.medicineKits + 20,
            },
            shortages: {
              ...c.shortages,
              waterBottles: Math.max(0, c.shortages.waterBottles - 150),
              medicineKits: Math.max(0, c.shortages.medicineKits - 20),
            },
          };
        }
        return c;
      })
    );

    showToast(`🚚 Relief Convoy Dispatched: ${plan.sourceWarehouseName} ➔ ${plan.targetCampName} via Safe Route C!`);
  };

  const handleAddVolunteer = (newVol: Volunteer) => {
    setVolunteers((prev) => [newVol, ...prev]);
    showToast(`👥 Volunteer Registered: ${newVol.name} added to emergency pool.`);
  };

  const handleUpdateVolunteerStatus = (id: string, status: Volunteer['status']) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const handleAddDamageReport = (rep: DamageIncidentReport) => {
    setDamageReports((prev) => [rep, ...prev]);
    showToast(`⚠️ Hazard Ingested: ${rep.category} at ${rep.locationName} (AI Verified).`);
  };

  const handleAddMissingPerson = (person: MissingPersonReport) => {
    setMissingPersons((prev) => [person, ...prev]);
    showToast(`🧭 Missing Person Dossier Filed: ${person.fullName}.`);
  };

  const handleAddSighting = (id: string, sightingText: string) => {
    setMissingPersons((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, sightingsCount: p.sightingsCount + 1, status: 'Sighted' } : p
      )
    );
    showToast(`👁️ Field Sighting Logged for Missing Citizen.`);
  };

  const isolatedCommunities = communities.filter((v) => v.isCommIsolated || v.isPhysicallyIsolated);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-red-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs max-w-md animate-in slide-in-from-bottom duration-300 ring-2 ring-red-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulatedOffline={isSimulatedOffline}
        toggleOfflineSimulation={toggleOfflineSimulation}
        coveragePercent={meshResult.coveragePercent}
        isolatedCount={isolatedCommunities.length}
        onSimulateDisaster={handleSimulateDisaster}
        onResetDisaster={handleResetDisaster}
        isDisasterActive={isDisasterActive}
        pendingOfflineCount={pendingOfflineCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'command-map' && (
          <div className="space-y-4">
            <CommandMap
              communities={communities}
              infraNodes={infraNodes}
              sosRequests={sosRequests}
              reliefCamps={reliefCamps}
              warehouses={warehouses}
              volunteers={volunteers}
              roads={roads}
              onSelectCommunity={(v) => setSelectedVillageId(v.id)}
              selectedVillageId={selectedVillageId}
            />

            {/* Quick Metrics Bar below Map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">SignalMesh Reach</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{meshResult.coveragePercent}%</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Critical Incidents</span>
                <span className="text-xl font-bold font-mono text-red-400">{sosRequests.length} Active</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Relief Camps</span>
                <span className="text-xl font-bold font-mono text-cyan-400">{reliefCamps.length} Managed</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Volunteer Responders</span>
                <span className="text-xl font-bold font-mono text-purple-400">{volunteers.length} Ready</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signal-mesh' && (
          <SignalMeshPanel
            meshResult={meshResult}
            communities={communities}
            infraNodes={infraNodes}
            links={links}
            onToggleLink={handleToggleLink}
            onToggleNode={handleToggleNode}
            onAuthorizeRelay={handleAuthorizeRelay}
          />
        )}

        {activeTab === 'citizen-sos' && (
          <CitizenSosPortal
            onAddSos={handleAddSos}
            isSimulatedOffline={isSimulatedOffline}
            toggleOfflineSimulation={toggleOfflineSimulation}
            activeSosList={sosRequests}
          />
        )}

        {activeTab === 'damage-reports' && (
          <DamageReportPortal
            reports={damageReports}
            onAddReport={handleAddDamageReport}
          />
        )}

        {activeTab === 'resource-match' && (
          <ResourceMatchView
            camps={reliefCamps}
            warehouses={warehouses}
            volunteers={volunteers}
            roads={roads}
            onDispatchSupplies={handleDispatchSupplies}
          />
        )}

        {activeTab === 'volunteers' && (
          <VolunteersView
            volunteers={volunteers}
            onAddVolunteer={handleAddVolunteer}
            onUpdateStatus={handleUpdateVolunteerStatus}
          />
        )}

        {activeTab === 'missing-persons' && (
          <MissingPersonsView
            reports={missingPersons}
            onAddReport={handleAddMissingPerson}
            onAddSighting={handleAddSighting}
          />
        )}

        {activeTab === 'resilience' && (
          <ResilienceAuditsView communities={communities} />
        )}

        {activeTab === 'simulator' && (
          <DisasterSimulator
            infraNodes={infraNodes}
            roads={roads}
            links={links}
            onToggleNode={handleToggleNode}
            onToggleRoad={handleToggleRoad}
            onRunDemoScenario={handleSimulateDisaster}
            onResetAll={handleResetDisaster}
            isDisasterActive={isDisasterActive}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          ResQMesh — Disaster Response Coordination & SignalMesh Platform • Surakshit Bharat (Track A: Product & Technology)
        </p>
      </footer>
    </div>
  );
};
export default App;
