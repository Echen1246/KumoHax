import { create } from 'zustand';
import type { Patient } from '../lib/api';

export type PatientsState = {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  setPatients: (patients: Patient[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
};

export const usePatientsStore = create<PatientsState>((set) => ({
  patients: [],
  isLoading: false,
  error: null,
  setPatients: (patients) => set({ patients }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 