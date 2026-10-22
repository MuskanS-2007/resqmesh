import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  CommunityNode,
  CommInfrastructureNode,
  SosRequest,
  ReliefCamp,
  ResourceWarehouse,
  Volunteer,
  RoadEdge,
} from '../types';
import {
  AlertTriangle,
  Radio,
  Users,
  Home,
  Package,
  Layers,
  MapPin,
  Crosshair,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CommandMapProps {
  communities: CommunityNode[];
  infraNodes: CommInfrastructureNode[];
  sosRequests: SosRequest[];
  reliefCamps: ReliefCamp[];
  warehouses: ResourceWarehouse[];
  volunteers: Volunteer[];
  roads: RoadEdge[];
  onSelectCommunity?: (village: CommunityNode) => void;
  selectedVillageId?: string | null;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  communities,
  infraNodes,
  sosRequests,
  reliefCamps,
  warehouses,
  volunteers,
  roads,
  onSelectCommunity,
  selectedVillageId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'sos' | 'infra' | 'relief'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'village' | 'sos' | 'camp' | 'infra';
    data: any;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Vijayawada
    const map = L.map(mapContainerRef.current, {
      center: [16.5150, 80.6400],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark high-contrast disaster base tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const roadsLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    roadsLayerRef.current = roadsLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Roads & Markers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !roadsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    roadsLayerRef.current.clearLayers();

    // 1. Draw Road Network
    roads.forEach((road) => {
      // Find coordinates of from and to nodes
      const allNodes = [...communities, ...infraNodes, ...warehouses, ...reliefCamps];
      const from = allNodes.find((n) => n.id === road.fromNodeId);
      const to = allNodes.find((n) => n.id === road.toNodeId);

      if (from && to) {
        let roadColor = '#10b981'; // green for open
        let dashArray: string | undefined = undefined;
        let weight = 4;

        if (road.condition === 'Submerged_Closed') {
          roadColor = '#ef4444'; // red for flooded
          dashArray = '6, 8';
          weight = 5;
        } else if (road.condition === 'Partially_Flooded') {
          roadColor = '#f59e0b'; // amber for warning
          dashArray = '4, 4';
          weight = 4;
        }

        const poly = L.polyline([from.coordinates, to.coordinates], {
          color: roadColor,
          weight,
          dashArray,
          opacity: 0.85,
        });

        poly.bindTooltip(`🛣️ ${road.name}: ${road.condition.replace('_', ' ')} (${road.waterDepthCm}cm water)`, {
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1 shadow-lg',
        });

        roadsLayerRef.current?.addLayer(poly);
      }
    });

    // 2. Draw Infrastructure Nodes (Towers, Control Center, Radio)
    if (activeFilter === 'all' || activeFilter === 'infra') {
      infraNodes.forEach((node) => {
        const isUp = node.isOperational;
        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
              node.type === 'Control_Center'
                ? 'bg-amber-600 border-amber-300 text-white'
                : isUp
                ? 'bg-cyan-600 border-cyan-300 text-white ring-2 ring-cyan-500/50'
                : 'bg-red-950 border-red-500 text-red-400 opacity-80'
            }">
              <span class="text-xs font-bold">${node.type === 'Control_Center' ? '🏛️' : isUp ? '📡' : '❌'}</span>
            </div>
            ${isUp ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-infra-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(node.coordinates, { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'infra', data: node });
        });

        marker.bindTooltip(`<strong>${node.name}</strong><br/>Status: ${isUp ? 'Operational ✅' : 'FAILED / OFFLINE ❌'}`, {
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1',
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Draw Relief Camps & Warehouses
    if (activeFilter === 'all' || activeFilter === 'relief') {
      reliefCamps.forEach((camp) => {
        const occupancyPct = Math.round((camp.currentOccupancy / camp.capacity) * 100);
        const iconHtml = `
          <div class="w-7 h-7 rounded-lg bg-emerald-600 border border-emerald-300 text-white flex items-center justify-center shadow-lg">
            <span class="text-xs">🏕️</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'camp-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(camp.coordinates, { icon });
        marker.on('click', () => setSelectedItem({ type: 'camp', data: camp }));
        marker.bindTooltip(`<strong>${camp.name}</strong><br/>Occupancy: ${occupancyPct}% full`, {
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1',
        });
        markersLayerRef.current?.addLayer(marker);
      });

      warehouses.forEach((wh) => {
        const iconHtml = `
          <div class="w-7 h-7 rounded-lg bg-amber-600 border border-amber-300 text-white flex items-center justify-center shadow-lg">
            <span class="text-xs">📦</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'warehouse-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(wh.coordinates, { icon });
        marker.bindTooltip(`<strong>${wh.name}</strong><br/>Disaster Supplies Depot`, {
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1',
        });
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 4. Draw Communities / Villages
    if (activeFilter === 'all' || activeFilter === 'infra') {
      communities.forEach((village) => {
        const isIsolated = village.isPhysicallyIsolated || village.isCommIsolated;
        const isSelected = selectedVillageId === village.id;

        let bgColor = 'bg-emerald-600';
        let borderColor = 'border-emerald-300';
        if (isIsolated) {
          bgColor = 'bg-red-600 animate-emergency-ping';
          borderColor = 'border-white';
        } else if (village.floodRisk === 'Severe') {
          bgColor = 'bg-rose-600';
          borderColor = 'border-rose-300';
        } else if (village.floodRisk === 'High') {
          bgColor = 'bg-amber-600';
          borderColor = 'border-amber-300';
        }

        const iconHtml = `
          <div class="relative cursor-pointer transition-transform hover:scale-125">
            <div class="w-7 h-7 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center text-white shadow-xl ${
              isSelected ? 'ring-4 ring-yellow-400' : ''
            }">
              <span class="text-[10px] font-black">${village.sosCount}</span>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-slate-200 text-[9px] font-semibold px-1 rounded border border-slate-700 pointer-events-none">
              ${village.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'village-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(village.coordinates, { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'village', data: village });
          if (onSelectCommunity) onSelectCommunity(village);
        });

        marker.bindTooltip(
          `<strong>${village.name}</strong><br/>Pop: ${village.population.toLocaleString()} | Risk: ${village.floodRisk}<br/>Comm: ${village.commStatus}`,
          {
            className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1',
          }
        );

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 5. Draw Critical SOS Markers
    if (activeFilter === 'all' || activeFilter === 'sos') {
      sosRequests.forEach((sos) => {
        if (sos.status === 'Resolved') return;

        const iconHtml = `
          <div class="relative flex items-center justify-center animate-bounce">
            <div class="w-6 h-6 rounded-full bg-red-600 border-2 border-red-200 flex items-center justify-center text-white shadow-xl">
              <span class="text-[9px] font-bold">🆘</span>
            </div>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></span>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'sos-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(sos.coordinates, { icon });
        marker.on('click', () => setSelectedItem({ type: 'sos', data: sos }));
        marker.bindTooltip(`<strong>${sos.category} (${sos.headcount} ppl)</strong><br/>${sos.locationName}<br/>Score: ${sos.priorityScore}/100`, {
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded p-1',
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [communities, infraNodes, sosRequests, reliefCamps, warehouses, volunteers, roads, activeFilter, selectedVillageId]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Filter Controls Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'all' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveFilter('sos')}
          className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'sos' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span>SOS Incidents ({sosRequests.filter((s) => s.status !== 'Resolved').length})</span>
        </button>
        <button
          onClick={() => setActiveFilter('infra')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'infra' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          SignalMesh & Communities
        </button>
        <button
          onClick={() => setActiveFilter('relief')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'relief' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Relief Camps & Logistics
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl flex items-center flex-wrap gap-3">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">LEGEND:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span>Isolated / Cutoff Node</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Connected Village</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-red-500 border-b border-dashed border-red-300" />
          <span>Submerged Road (Closed)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-emerald-500" />
          <span>Safe Relief Route</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs">🏕️</span>
          <span>Relief Camp</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs">📡</span>
          <span>Cell Tower</span>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedItem && (
        <div className="absolute top-3 right-3 z-10 w-84 bg-slate-900/95 backdrop-blur-lg p-4 rounded-xl border border-slate-700 shadow-2xl text-slate-200 animate-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                {selectedItem.type === 'village'
                  ? 'COMMUNITY INCIDENT PROFILE'
                  : selectedItem.type === 'sos'
                  ? 'CITIZEN SOS DOSSIER'
                  : selectedItem.type === 'camp'
                  ? 'RELIEF CAMP REPORT'
                  : 'INFRASTRUCTURE NODE'}
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {selectedItem.data.name || selectedItem.data.category}
              </h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 leading-none"
            >
              ✕
            </button>
          </div>

          {selectedItem.type === 'village' && (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Population:</span>
                <span className="font-semibold">{selectedItem.data.population.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Flood Hazard:</span>
                <span className={`font-bold ${selectedItem.data.floodRisk === 'Severe' ? 'text-red-400' : 'text-amber-400'}`}>
                  {selectedItem.data.floodRisk}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Communication:</span>
                <span className={`font-semibold ${selectedItem.data.isCommIsolated ? 'text-red-400 font-bold' : 'text-cyan-400'}`}>
                  {selectedItem.data.commStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Road Egress:</span>
                <span className={`font-semibold ${selectedItem.data.roadStatus === 'Submerged_Closed' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedItem.data.roadStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Emergency SOS Requests:</span>
                <span className="font-bold text-red-400">{selectedItem.data.sosCount} active</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Trapped Citizens:</span>
                <span className="font-bold text-amber-400">{selectedItem.data.trappedPersons} persons</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Resilience Score:</span>
                <span className="font-bold text-yellow-400">{selectedItem.data.resilienceScore}/100</span>
              </div>

              {selectedItem.data.isPhysicallyIsolated && (
                <div className="bg-red-950/70 border border-red-700/80 p-2.5 rounded-lg text-red-200">
                  <div className="flex items-center space-x-1.5 font-bold text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>🔴 COMMUNITY ISOLATION RISK</span>
                  </div>
                  <p className="text-[11px] mt-1 text-red-200">
                    Dual isolation detected: All physical road connections flooded + primary telecom disconnected. Requires boat dispatch or volunteer relay!
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedItem.type === 'sos' && (
            <div className="space-y-2.5 text-xs">
              <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                <span className="text-[10px] text-red-400 font-bold">ALGORITHMIC PRIORITY SCORE</span>
                <div className="text-xl font-extrabold text-red-400">
                  {selectedItem.data.priorityScore}/100 ({selectedItem.data.urgency})
                </div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Headcount:</span>
                <span className="font-bold text-white">{selectedItem.data.headcount} people</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-200">{selectedItem.data.locationName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Needs Requested:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.data.needs.map((n: string) => (
                    <span key={n} className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-amber-300 border border-slate-700">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              {selectedItem.data.medicalDetails && (
                <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                  <span className="text-[10px] font-bold text-rose-300 uppercase block">Medical Details:</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">{selectedItem.data.medicalDetails}</p>
                </div>
              )}
            </div>
          )}

          {selectedItem.type === 'camp' && (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Capacity:</span>
                <span className="font-semibold">{selectedItem.data.currentOccupancy} / {selectedItem.data.capacity} ({Math.round(selectedItem.data.currentOccupancy / selectedItem.data.capacity * 100)}% Full)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Water Supply:</span>
                <span className={`font-bold ${selectedItem.data.supplies.waterBottles < 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedItem.data.supplies.waterBottles} bottles
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Medical Kits:</span>
                <span className={`font-bold ${selectedItem.data.supplies.medicineKits < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedItem.data.supplies.medicineKits} kits
                </span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-amber-300">
                <span className="font-bold block">Critical Shortage:</span>
                <span>Needs {selectedItem.data.shortages.waterBottles} water bottles & {selectedItem.data.shortages.medicineKits} medical kits.</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'infra' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Type:</span>
                <span className="font-semibold">{selectedItem.data.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${selectedItem.data.isOperational ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedItem.data.isOperational ? 'OPERATIONAL' : 'OFFLINE / FLOOD DAMAGED'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Range:</span>
                <span>{selectedItem.data.rangeKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Battery Backup:</span>
                <span>{selectedItem.data.batteryBackupHours} hours remaining</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
