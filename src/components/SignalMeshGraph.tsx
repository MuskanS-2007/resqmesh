import React from 'react';
import {
  CommunityNode,
  CommInfrastructureNode,
  CommLink,
  CommStatus,
} from '../types';

interface SignalMeshGraphProps {
  communities: CommunityNode[];
  infraNodes: CommInfrastructureNode[];
  links: CommLink[];
  onToggleLink?: (linkId: string) => void;
  onToggleNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const SignalMeshGraph: React.FC<SignalMeshGraphProps> = ({
  communities,
  infraNodes,
  links,
  onToggleLink,
  onToggleNode,
  selectedNodeId,
  onSelectNode,
}) => {
  // Fixed canvas coordinates for visual graph layout (Width: 900, Height: 520)
  const nodePositions: Record<string, { x: number; y: number; label: string; type: string }> = {
    // Top Core: Control Center
    'node-cc': { x: 450, y: 55, label: 'Control Center (HQ)', type: 'hq' },
    
    // Tier 1: Core Distribution Nodes
    'node-radio-1': { x: 140, y: 140, label: 'Radio Broadcast (AIR)', type: 'radio' },
    'node-t1': { x: 300, y: 155, label: 'Tower T1 (West)', type: 'tower' },
    'node-t2': { x: 500, y: 155, label: 'Tower T2 (Central)', type: 'tower' },
    'node-t3': { x: 740, y: 155, label: 'Tower T3 (East)', type: 'tower' },
    'node-sat-1': { x: 830, y: 65, label: 'Sat Ground Station', type: 'sat' },

    // Tier 2 & 3: 12 Communities
    'village-1': { x: 230, y: 260, label: 'Ibrahimpatnam', type: 'village' },
    'village-2': { x: 340, y: 265, label: 'Gollapudi', type: 'village' },
    'village-3': { x: 440, y: 275, label: 'Bhavanipuram', type: 'village' },
    'village-4': { x: 540, y: 280, label: 'Krishna Lanka', type: 'village' },
    'village-5': { x: 490, y: 360, label: 'Governorpet', type: 'village' },
    'village-6': { x: 580, y: 370, label: 'Patamata', type: 'village' },
    'village-7': { x: 670, y: 275, label: 'Auto Nagar', type: 'village' },
    'village-8': { x: 720, y: 365, label: 'Kanuru', type: 'village' },
    'village-9': { x: 800, y: 270, label: 'Ramavarappadu', type: 'village' },
    'village-10': { x: 840, y: 350, label: 'Enikepadu', type: 'village' },
    'village-11': { x: 690, y: 460, label: 'Penamaluru', type: 'village' },
    'village-12': { x: 830, y: 465, label: 'Vuyyuru', type: 'village' },
  };

  const infraMap = new Map(infraNodes.map((n) => [n.id, n]));
  const villageMap = new Map(communities.map((v) => [v.id, v]));

  const getLinkColor = (link: CommLink) => {
    if (link.status === 'Failed') return '#ef4444'; // Red failed
    switch (link.channel) {
      case 'Fiber_Internet':
        return '#10b981'; // Emerald
      case 'Cellular_SMS':
        return '#06b6d4'; // Cyan
      case 'HF_VHF_Radio':
        return '#f59e0b'; // Amber
      case 'Volunteer_Mesh_Relay':
        return '#a855f7'; // Purple
      default:
        return '#64748b';
    }
  };

  return (
    <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 p-2 shadow-inner">
      <svg
        viewBox="0 0 940 530"
        className="w-full min-w-[800px] h-auto select-none font-sans"
      >
        <defs>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid Pattern */}
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1e293b" />
        </pattern>
        <rect width="940" height="530" fill="url(#grid)" />

        {/* 1. Draw Links */}
        <g id="links-group">
          {links.map((link) => {
            const p1 = nodePositions[link.sourceId];
            const p2 = nodePositions[link.targetId];
            if (!p1 || !p2) return null;

            const isFailed = link.status === 'Failed';
            const strokeColor = getLinkColor(link);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g
                key={link.id}
                className="cursor-pointer group"
                onClick={() => onToggleLink && onToggleLink(link.id)}
              >
                {/* Clickable hit area */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="12"
                />

                {/* Visible link */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={isFailed ? '1.5' : link.channel === 'Volunteer_Mesh_Relay' ? '2.5' : '2'}
                  strokeDasharray={
                    isFailed
                      ? '4 4'
                      : link.channel === 'Cellular_SMS'
                      ? '6 4'
                      : link.channel === 'HF_VHF_Radio'
                      ? '8 4'
                      : link.channel === 'Volunteer_Mesh_Relay'
                      ? '5 5'
                      : undefined
                  }
                  className={
                    isFailed
                      ? 'opacity-40'
                      : link.channel === 'Fiber_Internet'
                      ? 'mesh-flow-active'
                      : link.channel === 'Cellular_SMS'
                      ? 'mesh-flow-sms'
                      : link.channel === 'Volunteer_Mesh_Relay'
                      ? 'mesh-flow-relay'
                      : ''
                  }
                />

                {/* Fail cross mark on link if failed */}
                {isFailed && (
                  <text
                    x={midX}
                    y={midY}
                    fill="#ef4444"
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold select-none"
                  >
                    ❌
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 2. Draw Nodes */}
        <g id="nodes-group">
          {Object.entries(nodePositions).map(([nodeId, pos]) => {
            const isInfra = nodeId.startsWith('node-');
            const infra = infraMap.get(nodeId);
            const village = villageMap.get(nodeId);

            const isOperational = isInfra ? infra?.isOperational : village?.commStatus !== 'Isolated_No_Signal';
            const isIsolated = !isInfra && village?.commStatus === 'Isolated_No_Signal';
            const isSelected = selectedNodeId === nodeId;

            let fillColor = '#0284c7';
            let strokeColor = '#38bdf8';
            let iconText = '📡';
            let nodeRadius = 18;

            if (pos.type === 'hq') {
              fillColor = '#b45309';
              strokeColor = '#fbbf24';
              iconText = '🏛️';
              nodeRadius = 24;
            } else if (pos.type === 'radio') {
              fillColor = '#d97706';
              strokeColor = '#fde047';
              iconText = '📻';
              nodeRadius = 19;
            } else if (pos.type === 'tower') {
              fillColor = isOperational ? '#0369a1' : '#450a0a';
              strokeColor = isOperational ? '#38bdf8' : '#ef4444';
              iconText = isOperational ? '📡' : '⚠️';
              nodeRadius = 20;
            } else if (pos.type === 'sat') {
              fillColor = '#4338ca';
              strokeColor = '#818cf8';
              iconText = '🛰️';
              nodeRadius = 17;
            } else {
              // Village Node
              nodeRadius = 16;
              if (isIsolated) {
                fillColor = '#7f1d1d';
                strokeColor = '#ef4444';
                iconText = '🔴';
              } else if (village?.commStatus === 'Volunteer_Relay') {
                fillColor = '#581c87';
                strokeColor = '#c084fc';
                iconText = '👥';
              } else if (village?.commStatus === 'Radio_Broadcast') {
                fillColor = '#78350f';
                strokeColor = '#f59e0b';
                iconText = '📻';
              } else if (village?.commStatus === 'SMS_Only') {
                fillColor = '#164e63';
                strokeColor = '#22d3ee';
                iconText = '💬';
              } else {
                fillColor = '#064e3b';
                strokeColor = '#34d399';
                iconText = '📶';
              }
            }

            return (
              <g
                key={nodeId}
                className="cursor-pointer group transition-transform duration-200"
                onClick={() => {
                  if (onSelectNode) onSelectNode(nodeId);
                  if (isInfra && onToggleNode) onToggleNode(nodeId);
                }}
              >
                {/* Pulse ring for isolated or HQ */}
                {(isIsolated || pos.type === 'hq') && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke={isIsolated ? '#ef4444' : '#f59e0b'}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 7}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter={isIsolated ? 'url(#glow-red)' : isOperational ? 'url(#glow-green)' : undefined}
                />

                {/* Icon Emoji */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fill="#ffffff"
                  fontSize={nodeRadius > 18 ? '13' : '11'}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none select-none"
                >
                  {iconText}
                </text>

                {/* Node Label Below */}
                <text
                  x={pos.x}
                  y={pos.y + nodeRadius + 11}
                  fill={isIsolated ? '#fca5a5' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={pos.type === 'hq' ? 'bold' : 'normal'}
                  textAnchor="middle"
                  className="pointer-events-none select-none font-medium"
                >
                  {pos.label}
                </text>

                {/* Village Reachability Tag */}
                {!isInfra && village && (
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + 21}
                    fill={isIsolated ? '#ef4444' : '#94a3b8'}
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none uppercase font-mono"
                  >
                    {isIsolated ? 'DISCONNECTED' : village.commStatus.replace('_', ' ')}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
