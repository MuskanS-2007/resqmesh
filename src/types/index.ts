// ==========================================
// RESQMESH SYSTEM DATA TYPES & INTERFACES
// ==========================================

export type EmergencyCategory =
  | 'Flooding / Trapped'
  | 'Medical Emergency'
  | 'Drinking Water'
  | 'Food Supply'
  | 'Rescue Boat Required'
  | 'Shelter Needed'
  | 'Electricity / Power Outage'
  | 'Road Blockage / Bridge Collapse'
  | 'Missing Person';

export type PriorityLevel = 'Critical' | 'Urgent' | 'High' | 'Moderate' | 'Low';

export type CommChannelType = 'Fiber_Internet' | 'Cellular_SMS' | 'HF_VHF_Radio' | 'Volunteer_Mesh_Relay' | 'Satellite';

export type CommStatus =
  | 'Full_Internet'
  | 'SMS_Only'
  | 'Radio_Broadcast'
  | 'Volunteer_Relay'
  | 'Isolated_No_Signal';

export type RoadCondition = 'Clear' | 'Partially_Flooded' | 'Submerged_Closed';

export interface CommunityNode {
  id: string;
  name: string;
  zone: string;
  population: number;
  floodRisk: 'Low' | 'Medium' | 'High' | 'Severe';
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  
  // Dynamic disaster stats
  sosCount: number;
  foodRequests: number;
  medicalRequests: number;
  waterRequests: number;
  shelterRequests: number;
  trappedPersons: number;
  
  // Physical & Network status
  commStatus: CommStatus;
  commPath: string[]; // e.g. ["Control Center", "Tower 2", "Village Gollapudi"]
  activeChannel: CommChannelType | 'None';
  roadStatus: RoadCondition;
  isPhysicallyIsolated: boolean;
  isCommIsolated: boolean;
  
  // Preparedness & Resilience
  nearestReliefCenterKm: number;
  resilienceScore: number; // 0-100
  resilienceBreakdown: {
    commRedundancy: number; // 0-100
    roadAccessibility: number; // 0-100
    resourceProximity: number; // 0-100
    shelterAccess: number; // 0-100
    spofVulnerability: string;
  };
}

export interface CommInfrastructureNode {
  id: string;
  name: string;
  type: 'Control_Center' | 'Cell_Tower' | 'Radio_Station' | 'Satellite_Uplink';
  coordinates: [number, number];
  isOperational: boolean;
  batteryBackupHours: number;
  rangeKm: number;
  supportedChannels: CommChannelType[];
}

export interface CommLink {
  id: string;
  sourceId: string;
  targetId: string;
  channel: CommChannelType;
  status: 'Active' | 'Failed' | 'Degraded';
  reliability: number; // 0.0 - 1.0
  description?: string;
}

export interface RoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  condition: RoadCondition;
  waterDepthCm: number;
  name: string;
}

export interface SosRequest {
  id: string;
  timestamp: string;
  citizenName: string;
  phone: string;
  locationName: string;
  coordinates: [number, number];
  headcount: number;
  category: EmergencyCategory;
  urgency: PriorityLevel;
  needs: string[];
  medicalDetails?: string;
  priorityScore: number; // 0-100
  priorityReasons: string[];
  status: 'Pending' | 'Triaged' | 'Dispatched' | 'Resolved';
  isOfflineSynced: boolean;
  clusterId?: string;
  assignedVolunteerId?: string;
}

export interface ReliefCamp {
  id: string;
  name: string;
  zone: string;
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  contactPerson: string;
  phone: string;
  supplies: {
    waterBottles: number;
    foodPackets: number;
    medicineKits: number;
    blankets: number;
  };
  shortages: {
    waterBottles: number;
    foodPackets: number;
    medicineKits: number;
    blankets: number;
  };
}

export interface ResourceWarehouse {
  id: string;
  name: string;
  organization: string; // e.g. "NDRF Red Cross", "AP State Disaster Depot"
  coordinates: [number, number];
  stock: {
    waterBottles: number;
    foodPackets: number;
    medicineKits: number;
    blankets: number;
    inflatableBoats: number;
  };
}

export interface Volunteer {
  id: string;
  name: string;
  zone: string;
  phone: string;
  coordinates: [number, number];
  skills: ('First Aid' | 'Water Rescue' | 'HAM Radio' | 'Doctor/Paramedic' | 'Logistics' | 'Boat Pilot')[];
  vehicleType: 'Motorcycle' | '4x4 Tractor/Jeep' | 'Inflatable Rescue Boat' | 'Heavy Truck' | 'None (Foot)';
  vehicleCapacityKg: number;
  status: 'Available' | 'Dispatched' | 'Relaying_Comm' | 'Offline';
  currentMission?: string;
}

export interface DamageIncidentReport {
  id: string;
  timestamp: string;
  reporterName: string;
  category: 'Flooded Road' | 'Bridge Structural Damage' | 'Fallen Tree / Powerline' | 'Landslide' | 'Building Collapse';
  locationName: string;
  coordinates: [number, number];
  description: string;
  aiClassification: string;
  aiConfidence: number;
  photoUrl?: string;
  reportedCount: number; // For duplicate clustering
  verified: boolean;
}

export interface MissingPersonReport {
  id: string;
  timestamp: string;
  fullName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  clothingDescription: string;
  contactNumber: string;
  status: 'Searching' | 'Sighted' | 'Reunited';
  sightingsCount: number;
}

export interface CommunicationRecommendation {
  id: string;
  targetVillageId: string;
  targetVillageName: string;
  currentStatus: string;
  recommendedAction: string;
  deployFromLocation: string;
  relayVolunteer?: string;
  requiredEquipment: string;
  projectedRestorationPercent: number;
}

export interface ResourceAllocationPlan {
  id: string;
  targetCampId: string;
  targetCampName: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  items: { item: string; quantity: number }[];
  recommendedRoute: {
    routeId: string;
    routeName: string;
    distanceKm: number;
    safetyStatus: 'Safe' | 'Alternative_Viable' | 'Flooded_Avoid';
    reason: string;
  };
  recommendedVolunteer?: Volunteer;
  status: 'Draft' | 'Approved' | 'In_Transit' | 'Delivered';
}
