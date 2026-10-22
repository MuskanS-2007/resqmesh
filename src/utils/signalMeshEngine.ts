import {
  CommunityNode,
  CommInfrastructureNode,
  CommLink,
  CommStatus,
  CommChannelType,
  CommunicationRecommendation,
} from '../types';

export interface SignalMeshResult {
  coveragePercent: number;
  reachableCount: number;
  totalVillages: number;
  unreachableVillages: CommunityNode[];
  channelBreakdown: {
    fiberInternet: number;
    cellularSms: number;
    radioBroadcast: number;
    volunteerRelay: number;
    isolated: number;
  };
  villageStatusMap: Map<string, {
    status: CommStatus;
    path: string[];
    activeChannel: CommChannelType | 'None';
  }>;
  recommendations: CommunicationRecommendation[];
}

/**
 * SignalMesh Graph Algorithm:
 * Evaluates message reachability from Emergency Control Center ('node-cc')
 * across all operational communication links and infrastructure nodes.
 */
export function calculateSignalMeshSurvivability(
  communities: CommunityNode[],
  infraNodes: CommInfrastructureNode[],
  links: CommLink[]
): SignalMeshResult {
  const infraMap = new Map(infraNodes.map((n) => [n.id, n]));
  const villageMap = new Map(communities.map((v) => [v.id, v]));

  // Build Adjacency Graph: node -> list of active links
  const adj = new Map<string, CommLink[]>();
  
  // Register all valid nodes
  infraNodes.forEach((n) => adj.set(n.id, []));
  communities.forEach((v) => adj.set(v.id, []));

  // Populate active links
  for (const link of links) {
    if (link.status === 'Failed') continue;

    // Check if intermediate infra node is down
    const sourceInfra = infraMap.get(link.sourceId);
    const targetInfra = infraMap.get(link.targetId);
    if (sourceInfra && !sourceInfra.isOperational) continue;
    if (targetInfra && !targetInfra.isOperational) continue;

    // Undirected or directed communication path
    if (adj.has(link.sourceId)) adj.get(link.sourceId)!.push(link);
    // Mesh links are bidirectional
    const reverseLink: CommLink = {
      ...link,
      id: `${link.id}-rev`,
      sourceId: link.targetId,
      targetId: link.sourceId,
    };
    if (adj.has(link.targetId)) adj.get(link.targetId)!.push(reverseLink);
  }

  // Channel priority hierarchy weight:
  // 1: Fiber_Internet (highest bandwidth, primary)
  // 2: Cellular_SMS (cellular backhaul)
  // 3: HF_VHF_Radio (community broadcast)
  // 4: Volunteer_Mesh_Relay (tactical courier / portable mesh)
  // 5: Satellite
  const channelPriority: Record<CommChannelType, number> = {
    Fiber_Internet: 1,
    Cellular_SMS: 2,
    HF_VHF_Radio: 3,
    Satellite: 4,
    Volunteer_Mesh_Relay: 5,
  };

  interface PathState {
    nodeId: string;
    path: string[];
    worstChannelRank: number; // Lowest rank along path
    primaryChannel: CommChannelType;
  }

  // BFS / Dijkstra reachability from 'node-cc'
  const controlCenterId = 'node-cc';
  const visited = new Map<string, PathState>();
  const queue: PathState[] = [
    {
      nodeId: controlCenterId,
      path: ['Control Center'],
      worstChannelRank: 0,
      primaryChannel: 'Fiber_Internet',
    },
  ];

  visited.set(controlCenterId, queue[0]);

  while (queue.length > 0) {
    // Sort queue by best channel rank then shortest path
    queue.sort((a, b) => a.worstChannelRank - b.worstChannelRank || a.path.length - b.path.length);
    const current = queue.shift()!;

    const neighbors = adj.get(current.nodeId) || [];
    for (const link of neighbors) {
      const neighborId = link.targetId;
      const rank = channelPriority[link.channel] || 5;
      const effectiveRank = Math.max(current.worstChannelRank, rank);
      
      const neighborNodeName =
        infraMap.get(neighborId)?.name || villageMap.get(neighborId)?.name || neighborId;

      const newPath = [...current.path, neighborNodeName];

      const existing = visited.get(neighborId);
      if (!existing || effectiveRank < existing.worstChannelRank || (effectiveRank === existing.worstChannelRank && newPath.length < existing.path.length)) {
        const nextState: PathState = {
          nodeId: neighborId,
          path: newPath,
          worstChannelRank: effectiveRank,
          primaryChannel: link.channel,
        };
        visited.set(neighborId, nextState);
        queue.push(nextState);
      }
    }
  }

  // Evaluate each village's status
  const villageStatusMap = new Map<string, {
    status: CommStatus;
    path: string[];
    activeChannel: CommChannelType | 'None';
  }>();

  let fiberCount = 0;
  let smsCount = 0;
  let radioCount = 0;
  let relayCount = 0;
  let isolatedCount = 0;
  const unreachableVillages: CommunityNode[] = [];

  for (const village of communities) {
    const reached = visited.get(village.id);
    if (!reached) {
      isolatedCount++;
      unreachableVillages.push(village);
      villageStatusMap.set(village.id, {
        status: 'Isolated_No_Signal',
        path: ['NO VIABLE PATHWAY FOUND'],
        activeChannel: 'None',
      });
      continue;
    }

    let status: CommStatus = 'Full_Internet';
    switch (reached.primaryChannel) {
      case 'Fiber_Internet':
        status = 'Full_Internet';
        fiberCount++;
        break;
      case 'Cellular_SMS':
        status = 'SMS_Only';
        smsCount++;
        break;
      case 'HF_VHF_Radio':
        status = 'Radio_Broadcast';
        radioCount++;
        break;
      case 'Volunteer_Mesh_Relay':
        status = 'Volunteer_Relay';
        relayCount++;
        break;
      default:
        status = 'SMS_Only';
        smsCount++;
    }

    villageStatusMap.set(village.id, {
      status,
      path: reached.path,
      activeChannel: reached.primaryChannel,
    });
  }

  const reachableCount = communities.length - isolatedCount;
  const coveragePercent = Math.round((reachableCount / communities.length) * 100);

  // Generate Decision Support Recommendations for Isolated Villages
  const recommendations: CommunicationRecommendation[] = [];

  for (const unreachable of unreachableVillages) {
    // Find nearest reachable community
    let nearestReachable: CommunityNode | null = null;
    let minDistance = Infinity;

    for (const other of communities) {
      if (visited.has(other.id)) {
        const dist = Math.hypot(
          unreachable.coordinates[0] - other.coordinates[0],
          unreachable.coordinates[1] - other.coordinates[1]
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestReachable = other;
        }
      }
    }

    const deployFrom = nearestReachable ? nearestReachable.name : 'Emergency Command Center';

    recommendations.push({
      id: `rec-${unreachable.id}`,
      targetVillageId: unreachable.id,
      targetVillageName: unreachable.name,
      currentStatus: '🔴 100% Disconnected (All primary towers offline)',
      recommendedAction: `Deploy tactical mobile volunteer relay from ${deployFrom} to ${unreachable.name}.`,
      deployFromLocation: deployFrom,
      relayVolunteer: 'Rajesh Kumar (HAM Operator VU2XYZ) / Motorcycle Team',
      requiredEquipment: 'Handheld 5W VHF Transceivers + Satellite Messenger terminal',
      projectedRestorationPercent: Math.round(100 / communities.length),
    });
  }

  return {
    coveragePercent,
    reachableCount,
    totalVillages: communities.length,
    unreachableVillages,
    channelBreakdown: {
      fiberInternet: fiberCount,
      cellularSms: smsCount,
      radioBroadcast: radioCount,
      volunteerRelay: relayCount,
      isolated: isolatedCount,
    },
    villageStatusMap,
    recommendations,
  };
}
