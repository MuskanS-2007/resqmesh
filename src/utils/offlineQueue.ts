import { SosRequest, DamageIncidentReport } from '../types';

const SOS_STORAGE_KEY = 'resqmesh_offline_sos_queue';
const INCIDENT_STORAGE_KEY = 'resqmesh_offline_incidents_queue';

let simulatedOffline = false;

export function isDeviceOffline(): boolean {
  if (simulatedOffline) return true;
  return typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

export function setSimulatedOffline(status: boolean): void {
  simulatedOffline = status;
}

export function getSimulatedOffline(): boolean {
  return simulatedOffline;
}

export function saveSosToOfflineQueue(sos: SosRequest): void {
  try {
    const queue = getOfflineSosQueue();
    queue.push(sos);
    localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
}

export function getOfflineSosQueue(): SosRequest[] {
  try {
    const data = localStorage.getItem(SOS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearOfflineSosQueue(): void {
  try {
    localStorage.removeItem(SOS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function saveIncidentToOfflineQueue(incident: DamageIncidentReport): void {
  try {
    const queue = getOfflineIncidentQueue();
    queue.push(incident);
    localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to save incident', err);
  }
}

export function getOfflineIncidentQueue(): DamageIncidentReport[] {
  try {
    const data = localStorage.getItem(INCIDENT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearOfflineIncidentQueue(): void {
  try {
    localStorage.removeItem(INCIDENT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
