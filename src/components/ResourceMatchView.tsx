import React, { useState } from 'react';
import {
  ReliefCamp,
  ResourceWarehouse,
  Volunteer,
  RoadEdge,
  ResourceAllocationPlan,
} from '../types';
import {
  generateResourceMatches,
} from '../utils/resourceMatchEngine';
import {
  evaluateSafeReliefRoutes,
  RouteOption,
} from '../utils/routingEngine';
import {
  Truck,
  Package,
  Home,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Shield,
  Activity,
  Users,
} from 'lucide-react';

interface ResourceMatchViewProps {
  camps: ReliefCamp[];
  warehouses: ResourceWarehouse[];
  volunteers: Volunteer[];
  roads: RoadEdge[];
  onDispatchSupplies: (plan: ResourceAllocationPlan) => void;
}

export const ResourceMatchView: React.FC<ResourceMatchViewProps> = ({
  camps,
  warehouses,
  volunteers,
  roads,
  onDispatchSupplies,
}) => {
  const [selectedCampId, setSelectedCampId] = useState<string>('camp-2'); // Camp Krishna (Bhavanipuram)
  const [activeRouteTab, setActiveRouteTab] = useState<'safe' | 'comparison'>('comparison');
  const [dispatchedPlans, setDispatchedPlans] = useState<string[]>([]);

  // Generated dynamic plans
  const allocationPlans = generateResourceMatches(camps, warehouses, volunteers, roads);

  // Evaluate candidate relief routes for the selected target
  const candidateRoutes: RouteOption[] = evaluateSafeReliefRoutes(roads, 'warehouse-1', selectedCampId);
  const selectedCamp = camps.find((c) => c.id === selectedCampId) || camps[0];

  const handleExecuteDispatch = (plan: ResourceAllocationPlan) => {
    onDispatchSupplies(plan);
    setDispatchedPlans([...dispatchedPlans, plan.id]);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Physical Relief Logistics Engine
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                ResourceMatch — Supply Optimizer & Safe Relief Routing
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Connects real physical supplies across warehouses and NGOs directly with camp shortages. Pairs shipments
              with registered volunteer vehicle capacities and guarantees <strong>viable road routing</strong> that avoids submerged highways.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL RELIEF CAMPS</span>
              <span className="text-xl font-black text-white font-mono">{camps.length} Sites</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">DEPOT RESERVES</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {warehouses.reduce((acc, w) => acc + w.stock.waterBottles, 0).toLocaleString()} Bottles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Camp Inventory & Occupancy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {camps.map((camp) => {
          const occupancyPct = Math.round((camp.currentOccupancy / camp.capacity) * 100);
          const isSelected = selectedCampId === camp.id;

          return (
            <div
              key={camp.id}
              onClick={() => setSelectedCampId(camp.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{camp.name}</h3>
                  <span className="text-[10px] text-slate-400">{camp.zone} • {camp.contactPerson}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                    occupancyPct >= 85
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {occupancyPct}% FULL
                </span>
              </div>

              {/* Occupancy bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3 border border-slate-800">
                <div
                  className={`h-full ${occupancyPct >= 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>

              {/* Resource meters */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Water Supply</span>
                  <span
                    className={`font-bold ${
                      camp.supplies.waterBottles < 100 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {camp.supplies.waterBottles} btls{' '}
                    {camp.shortages.waterBottles > 0 && `(Short ${camp.shortages.waterBottles})`}
                  </span>
                </div>

                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Medical Kits</span>
                  <span
                    className={`font-bold ${
                      camp.supplies.medicineKits < 10 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {camp.supplies.medicineKits} kits{' '}
                    {camp.shortages.medicineKits > 0 && `(Short ${camp.shortages.medicineKits})`}
                  </span>
                </div>

                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Food Packets</span>
                  <span className="font-bold text-slate-200">
                    {camp.supplies.foodPackets} pkts
                  </span>
                </div>

                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Blankets</span>
                  <span className="font-bold text-slate-200">
                    {camp.supplies.blankets} units
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Relief Routing Engine Comparison Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Safe Relief Routing Visualizer: Auto Nagar Depot ➔ {selectedCamp.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Disaster logistics does not dispatch blindly via the shortest path. Evaluates road viability, water depth, and bridge integrity.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Target Camp:</span>
            <span className="font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-700">
              {selectedCamp.name}
            </span>
          </div>
        </div>

        {/* Route Alternatives Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {candidateRoutes.map((route, idx) => {
            const isFlooded = route.safetyStatus === 'Flooded_Avoid';
            const isSafe = route.safetyStatus === 'Safe';

            return (
              <div
                key={route.routeId}
                className={`p-4 rounded-xl border flex flex-col justify-between text-xs space-y-3 relative ${
                  route.isRecommended
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-xl ring-1 ring-emerald-500'
                    : isFlooded
                    ? 'bg-red-950/30 border-red-800/70 opacity-90'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {route.isRecommended && (
                  <span className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    ★ RECOMMENDED BY ENGINE
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{route.routeName}</h4>
                      <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                        Distance: <strong>{route.totalDistanceKm} km</strong>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isFlooded
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : isSafe
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {route.safetyStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Waypoints sequence */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Hops / Segments:</span>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80 space-y-1">
                      {route.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-300 truncate">{seg.name}</span>
                          <span
                            className={`font-semibold ${
                              seg.condition === 'Submerged_Closed'
                                ? 'text-red-400'
                                : seg.condition === 'Partially_Flooded'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {seg.condition === 'Submerged_Closed' ? '❌ Submerged' : '✅ Clear'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p
                    className={`mt-2.5 text-[11px] p-2 rounded border leading-relaxed ${
                      isFlooded
                        ? 'bg-red-950/40 border-red-900 text-red-200'
                        : isSafe
                        ? 'bg-emerald-950/40 border-emerald-900 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-900 text-amber-200'
                    }`}
                  >
                    {route.recommendationReason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Resource Allocation Plans */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Automated Resource Allocation & Volunteer Dispatch Proposals
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supply-demand matching algorithm outputs approved logistics pairings ready for emergency dispatch.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {allocationPlans.map((plan) => {
            const isAlreadyDispatched = dispatchedPlans.includes(plan.id);

            return (
              <div
                key={plan.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-xs space-y-3 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      DISPATCH PAIRING ID: {plan.id}
                    </span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{plan.sourceWarehouseName}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <span className="text-emerald-400">{plan.targetCampName}</span>
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAlreadyDispatched ? (
                      <span className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Dispatched to Transport Convoy</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExecuteDispatch(plan)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Authorize & Dispatch Convoy</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Supplies Allocated */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Supplies Allocated:
                    </span>
                    <ul className="space-y-0.5 text-slate-200">
                      {plan.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between font-mono">
                          <span>{it.item}:</span>
                          <strong className="text-emerald-400">x{it.quantity}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Paired Responder */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Matched Responder:
                    </span>
                    {plan.recommendedVolunteer ? (
                      <div className="text-slate-300">
                        <strong className="text-white block">{plan.recommendedVolunteer.name}</strong>
                        <span className="text-[11px] text-slate-400 block">
                          Vehicle: {plan.recommendedVolunteer.vehicleType} (Payload {plan.recommendedVolunteer.vehicleCapacityKg}kg)
                        </span>
                        <span className="text-cyan-400 font-mono text-[10px] block mt-0.5">
                          {plan.recommendedVolunteer.phone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">NDRF Heavy Vehicle Depot</span>
                    )}
                  </div>

                  {/* Safe Routing Choice */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Approved Transit Route:
                    </span>
                    <div className="text-slate-300">
                      <strong className="text-emerald-300 block">{plan.recommendedRoute.routeName}</strong>
                      <span className="text-[10px] text-slate-400 block">
                        Safe clearance confirmed • {plan.recommendedRoute.distanceKm} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
