import axios from 'axios';

const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

console.log('[API] Initializing with base URL:', apiBaseUrl);

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

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

export async function fetchAlertsStream() {
  return new EventSource(`${apiBaseUrl}/events/alerts`);
} 