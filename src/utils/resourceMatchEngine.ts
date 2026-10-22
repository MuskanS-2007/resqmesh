import {
  ReliefCamp,
  ResourceWarehouse,
  Volunteer,
  RoadEdge,
  ResourceAllocationPlan,
} from '../types';
import { evaluateSafeReliefRoutes } from './routingEngine';

export interface AutoMatchPlan {
  camp: ReliefCamp;
  warehouse: ResourceWarehouse;
  items: { item: string; quantity: number }[];
  volunteer: Volunteer;
  route: {
    routeName: string;
    distanceKm: number;
    safetyStatus: 'Safe' | 'Alternative_Viable' | 'Flooded_Avoid';
    reason: string;
  };
}

export function generateResourceMatches(
  camps: ReliefCamp[],
  warehouses: ResourceWarehouse[],
  volunteers: Volunteer[],
  roads: RoadEdge[]
): ResourceAllocationPlan[] {
  const plans: ResourceAllocationPlan[] = [];

  // Sort camps by urgency (highest occupancy + largest water/medicine shortage)
  const sortedCamps = [...camps].sort((a, b) => {
    const aUrgency = a.shortages.waterBottles * 2 + a.shortages.medicineKits * 5 + (a.currentOccupancy / a.capacity) * 100;
    const bUrgency = b.shortages.waterBottles * 2 + b.shortages.medicineKits * 5 + (b.currentOccupancy / b.capacity) * 100;
    return bUrgency - aUrgency;
  });

  const availableVolunteers = volunteers.filter((v) => v.status === 'Available');

  for (let i = 0; i < sortedCamps.length; i++) {
    const camp = sortedCamps[i];
    
    // Check if camp has critical shortages
    const needsWater = camp.shortages.waterBottles;
    const needsFood = camp.shortages.foodPackets;
    const needsMeds = camp.shortages.medicineKits;
    const needsBlankets = camp.shortages.blankets;

    if (needsWater === 0 && needsFood === 0 && needsMeds === 0 && needsBlankets === 0) continue;

    // Find warehouse that has stock
    const primaryWarehouse = warehouses[0] || warehouses[1];
    if (!primaryWarehouse) continue;

    const items: { item: string; quantity: number }[] = [];
    if (needsWater > 0) items.push({ item: 'Drinking Water (1L Bottles)', quantity: Math.min(needsWater, 200) });
    if (needsFood > 0) items.push({ item: 'Ready-to-Eat Food Rations', quantity: Math.min(needsFood, 150) });
    if (needsMeds > 0) items.push({ item: 'Emergency Medical Trauma Kits', quantity: Math.min(needsMeds, 20) });
    if (needsBlankets > 0) items.push({ item: 'Thermal Blankets', quantity: Math.min(needsBlankets, 50) });

    // Evaluate safe route from Warehouse to Camp
    const routes = evaluateSafeReliefRoutes(roads, 'warehouse-1', camp.id);
    const bestRoute = routes.find((r) => r.isRecommended) || routes[routes.length - 1];

    // Pick appropriate volunteer based on payload
    const totalEstKg = (needsWater > 0 ? 100 : 0) + (needsFood > 0 ? 50 : 0) + 15;
    const matchedVolunteer = availableVolunteers.find((v) => v.vehicleCapacityKg >= totalEstKg) || availableVolunteers[0];

    plans.push({
      id: `alloc-plan-${camp.id}-${Date.now() + i}`,
      targetCampId: camp.id,
      targetCampName: camp.name,
      sourceWarehouseId: primaryWarehouse.id,
      sourceWarehouseName: primaryWarehouse.name,
      items,
      recommendedRoute: {
        routeId: bestRoute.routeId,
        routeName: bestRoute.routeName,
        distanceKm: bestRoute.totalDistanceKm,
        safetyStatus: bestRoute.safetyStatus,
        reason: bestRoute.recommendationReason,
      },
      recommendedVolunteer: matchedVolunteer,
      status: 'Approved',
    });
  }

  return plans;
}
