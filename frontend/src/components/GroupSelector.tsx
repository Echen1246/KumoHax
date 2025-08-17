import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';

export interface Group {
  id: string;
  name: string;
  description: string;
  patientCount: number;
  primaryDrug?: string;
  studyPhase?: string;
}

interface GroupSelectorProps {
  selectedGroup: Group | null;
  onGroupChange: (group: Group) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroup,
  onGroupChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real patient counts for groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        // Fetch all patients to determine available groups
        const response = await apiClient.get('/patients');
        const patients = response.data;
        
        if (patients.length === 0) {
          // No patients uploaded yet
          setGroups([{
            id: 'none',
            name: 'No Patients',
            description: 'Upload a CSV file to see patient groups',
            patientCount: 0,
          }]);
          setLoading(false);
          return;
        }

        // Create groups based on actual patient data
        const allGroup: Group = {
          id: 'all',
          name: 'All Patients',
          description: `All ${patients.length} patients from uploaded data`,
          patientCount: patients.length,
        };
        
        // Analyze medications to create drug-based groups
        const medicationGroups = new Map<string, any[]>();
        
        patients.forEach((patient: any) => {
          if (patient.medications && Array.isArray(patient.medications)) {
            patient.medications.forEach((medication: string) => {
              const med = medication.trim();
              if (med) {
                if (!medicationGroups.has(med)) {
                  medicationGroups.set(med, []);
                }
                medicationGroups.get(med)!.push(patient);
              }
            });
          }
        });
        
        // Create groups for medications with at least 2 patients
        const dynamicGroups: Group[] = [];
        medicationGroups.forEach((medPatients, medication) => {
          if (medPatients.length >= 2) {
            dynamicGroups.push({
              id: `${medication.toLowerCase()}-group`,
              name: `${medication} Patients`,
              description: `Patients taking ${medication}`,
              patientCount: medPatients.length,
              primaryDrug: medication,
              studyPhase: 'Active Monitoring',
            });
          }
        });
        
        // Sort dynamic groups by patient count descending
        dynamicGroups.sort((a, b) => b.patientCount - a.patientCount);
        
        // Combine all groups
        const finalGroups = [allGroup, ...dynamicGroups];
        
        setGroups(finalGroups);
        
        // Set initial group if none selected
        if (!selectedGroup) {
          onGroupChange(finalGroups[0]);
        }
        
      } catch (error) {
        console.error('Error fetching patient groups:', error);
        
        // Fallback to minimal groups
        const fallbackGroups: Group[] = [
          {
            id: 'all',
            name: 'All Patients',
            description: 'Error loading patient data',
            patientCount: 0,
          }
        ];
        
        setGroups(fallbackGroups);
        if (!selectedGroup) {
          onGroupChange(fallbackGroups[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []); // Remove dependency to avoid infinite loops

  const handleGroupSelect = (group: Group) => {
    onGroupChange(group);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md">
        <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>
        <span className="text-sm text-gray-500">Loading groups...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col items-start">
          <span className="text-lg font-semibold text-gray-900">
            {selectedGroup?.name || 'Select Group'}
          </span>
          {selectedGroup && (
            <span className="text-xs text-gray-500">
              {selectedGroup.patientCount.toLocaleString()} patients
              {selectedGroup.primaryDrug && ` • ${selectedGroup.primaryDrug}`}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={() => handleGroupSelect(group)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{group.name}</span>
                      {group.studyPhase && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {group.studyPhase}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>{group.patientCount.toLocaleString()} patients</span>
                      {group.primaryDrug && <span>Drug: {group.primaryDrug}</span>}
                    </div>
                  </div>
                  {selectedGroup?.id === group.id && (
                    <div className="ml-2">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}; 