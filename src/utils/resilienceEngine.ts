import { CommunityNode, CommLink, RoadEdge } from '../types';

export interface ResilienceReport {
  overallScore: number;
  commRedundancy: number;
  roadAccessibility: number;
  resourceProximity: number;
  shelterAccess: number;
  spofWarnings: string[];
}

export function evaluateCommunityResilience(
  village: CommunityNode,
  links: CommLink[],
  roads: RoadEdge[]
): ResilienceReport {
  // Count connected comm paths
  const incidentLinks = links.filter(
    (l) => (l.sourceId === village.id || l.targetId === village.id) && l.status !== 'Failed'
  );
  const channels = new Set(incidentLinks.map((l) => l.channel));
  const commRedundancy = Math.min(100, channels.size * 30 + (incidentLinks.length > 2 ? 10 : 0));

  // Count open roads
  const incidentRoads = roads.filter((r) => r.fromNodeId === village.id || r.toNodeId === village.id);
  const clearRoads = incidentRoads.filter((r) => r.condition === 'Clear');
  const roadAccessibility = incidentRoads.length === 0
    ? 20
    : Math.min(100, Math.round((clearRoads.length / incidentRoads.length) * 100));

  // Proximity to relief
  const resourceProximity = Math.max(20, Math.min(100, Math.round(100 - village.nearestReliefCenterKm * 8)));
  const shelterAccess = village.floodRisk === 'Severe' ? 45 : village.floodRisk === 'High' ? 65 : 85;

  const overallScore = Math.round(
    commRedundancy * 0.3 + roadAccessibility * 0.3 + resourceProximity * 0.2 + shelterAccess * 0.2
  );

  const spofWarnings: string[] = [];
  if (channels.size <= 1) {
    spofWarnings.push('Single point of communication failure: Relies solely on 1 carrier transmission path.');
  }
  if (incidentRoads.length <= 1) {
    spofWarnings.push('Single point of physical egress: One bridge/causeway serves entire population.');
  }
  if (village.floodRisk === 'Severe') {
    spofWarnings.push('Low elevation riverfront exposure: Flood inundation speed exceeds regional average.');
  }

  return {
    overallScore,
    commRedundancy,
    roadAccessibility,
    resourceProximity,
    shelterAccess,
    spofWarnings,
  };
}
