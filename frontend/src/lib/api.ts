import axios from 'axios';

const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export type Patient = {
  id: string;
  age: number;
  sex: string;
  race: string;
  risks: string[];
  riskScore: number; // 0..1
};

export type AlertEvent = {
  id: string;
  patientId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
};

export async function fetchPatients(): Promise<Patient[]> {
  const { data } = await apiClient.get<Patient[]>('/patients');
  return data;
}

export async function fetchAlerts(): Promise<AlertEvent[]> {
  const { data } = await apiClient.get<AlertEvent[]>('/alerts');
  return data;
} 