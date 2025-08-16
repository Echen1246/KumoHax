import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'all',
    name: 'All Patients',
    description: 'Complete patient population across all studies',
    patientCount: 2847,
  },
  {
    id: 'metformin-study',
    name: 'Metformin Cohort',
    description: 'Patients receiving metformin therapy',
    patientCount: 1234,
    primaryDrug: 'Metformin',
    studyPhase: 'Phase IV',
  },
  {
    id: 'warfarin-study',
    name: 'Warfarin Study',
    description: 'Anticoagulation safety monitoring',
    patientCount: 567,
    primaryDrug: 'Warfarin',
    studyPhase: 'Post-Market',
  },
  {
    id: 'oncology-trial',
    name: 'Oncology Trial #4287',
    description: 'Novel chemotherapy adverse event monitoring',
    patientCount: 423,
    primaryDrug: 'Investigational',
    studyPhase: 'Phase II',
  },
  {
    id: 'cardio-prevention',
    name: 'Cardiovascular Prevention',
    description: 'Statin and ACE inhibitor combination study',
    patientCount: 892,
    primaryDrug: 'Multi-drug',
    studyPhase: 'Phase III',
  },
];

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroup,
  onGroupChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGroupSelect = (group: Group) => {
    onGroupChange(group);
    setIsOpen(false);
  };

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
            {DEFAULT_GROUPS.map((group) => (
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