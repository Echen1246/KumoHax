import { create } from 'zustand';
import { AlertEvent } from '../lib/api';

export type AlertsState = {
  alerts: AlertEvent[];
  addAlert: (alert: AlertEvent) => void;
  clearAlerts: () => void;
};

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 200) })),
  clearAlerts: () => set({ alerts: [] }),
})); 