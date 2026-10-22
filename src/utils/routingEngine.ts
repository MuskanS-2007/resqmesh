import { RoadEdge, RoadCondition } from '../types';

export interface RouteOption {
  routeId: string;
  routeName: string;
  totalDistanceKm: number;
  safetyStatus: 'Safe' | 'Alternative_Viable' | 'Flooded_Avoid';
  pathNodes: string[];
  segments: {
    name: string;
    distanceKm: number;
    condition: RoadCondition;
    waterDepthCm: number;
  }[];
  recommendationReason: string;
  isRecommended: boolean;
}

export function evaluateSafeReliefRoutes(
  roads: RoadEdge[],
  originNodeId: string,
  destinationNodeId: string
): RouteOption[] {
  // Candidate routes for the Vijayawada demo scenario
  // Origin: Auto Nagar Warehouse (village-7) -> Destination: Kanuru Camp Godavari (village-8)
  
  const feederRoad = roads.find((r) => r.id === 'road-v7-v8');
  const altRidgeRoad = roads.find((r) => r.id === 'road-v6-v8-alt');
  const bypassRoad = roads.find((r) => r.id === 'road-v6-v7');

  const routeAIsFlooded = feederRoad ? feederRoad.condition === 'Submerged_Closed' : false;
  const routeAIsPartial = feederRoad ? feederRoad.condition === 'Partially_Flooded' : false;

  const routes: RouteOption[] = [
    {
      routeId: 'route-primary-direct',
      routeName: 'Route A — Kanuru Main Feeder (Direct Shortest)',
      totalDistanceKm: 2.9,
      safetyStatus: routeAIsFlooded ? 'Flooded_Avoid' : routeAIsPartial ? 'Alternative_Viable' : 'Safe',
      pathNodes: ['Auto Nagar Warehouse', 'Kanuru Main Feeder', 'Camp Godavari'],
      segments: [
        {
          name: 'Kanuru Main Feeder',
          distanceKm: 2.9,
          condition: feederRoad?.condition || 'Clear',
          waterDepthCm: feederRoad?.waterDepthCm || 0,
        },
      ],
      recommendationReason: routeAIsFlooded
        ? 'DANGER: Road submerged under 110cm swirling canal floodwaters. High probability of vehicle stall/swept away.'
        : routeAIsPartial
        ? 'CAUTION: Standing flood water (35cm). Usable only by heavy 4x4 or elevated tractors.'
        : 'OPTIMAL: Direct road clear, dry tarmac, lowest travel time (6 mins).',
      isRecommended: !routeAIsFlooded && !routeAIsPartial,
    },
    {
      routeId: 'route-bypass-interchange',
      routeName: 'Route B — Auto Nagar to Patamata Link (Secondary)',
      totalDistanceKm: 5.9,
      safetyStatus: 'Alternative_Viable',
      pathNodes: ['Auto Nagar Warehouse', 'Auto Nagar Connector', 'Patamata Junction', 'Camp Godavari'],
      segments: [
        {
          name: 'Auto Nagar Connector',
          distanceKm: 3.1,
          condition: bypassRoad?.condition || 'Clear',
          waterDepthCm: bypassRoad?.waterDepthCm || 0,
        },
        {
          name: 'Patamata Intermediate Feeder',
          distanceKm: 2.8,
          condition: 'Partially_Flooded',
          waterDepthCm: 25,
        },
      ],
      recommendationReason: 'Partially affected by street drainage backflow (25cm). Viable for high-clearance pickups and emergency ambulances.',
      isRecommended: false,
    },
    {
      routeId: 'route-high-elevation-safe',
      routeName: 'Route C — High-Elevation Ridge Route (Safe Relief)',
      totalDistanceKm: 8.5,
      safetyStatus: 'Safe',
      pathNodes: ['Auto Nagar Warehouse', 'Patamata Bypass', 'High-Elevation Ridge', 'Camp Godavari Western Gate'],
      segments: [
        {
          name: 'High-Elevation Ridge Route',
          distanceKm: 8.5,
          condition: 'Clear',
          waterDepthCm: 0,
        },
      ],
      recommendationReason: 'RECOMMENDED VIABLE PATH: Fully elevated embankment road, 0% water accumulation, 100% dry transit confirmed by highway patrol.',
      isRecommended: routeAIsFlooded || routeAIsPartial,
    },
  ];

  return routes;
}
