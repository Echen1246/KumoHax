import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Group } from '../components/GroupSelector';
import { apiClient } from '../lib/api';

interface Patient {
  id: string;
  age: number;
  sex: 'M' | 'F';
  race: string;
  medications: string[];
  comorbidities: string[];
  riskScore: number;
  predictedEvents: string[];
  lastUpdated: string;
}

interface LayoutContext {
  selectedGroup: Group | null;
  onGroupChange: (group: Group) => void;
}

export const PatientsPage: React.FC = () => {
  const { selectedGroup } = useOutletContext<LayoutContext>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add group filter if selected
        const params = selectedGroup && selectedGroup.id !== 'all' 
          ? `?group=${selectedGroup.id}` 
          : '';
        
        const response = await apiClient.get(`/patients${params}`);
        setPatients(response.data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient data. Please check your connection to the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [selectedGroup]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medications.some(med => med.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.comorbidities.some(cond => cond.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return { label: 'High', color: 'bg-red-100 text-red-800' };
    if (score >= 0.3) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data from Kumo RFM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 font-medium">Error loading patients</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">
            Monitor patient risk scores and adverse event predictions
            {selectedGroup && selectedGroup.id !== 'all' && (
              <span className="ml-2 text-blue-600">
                • Filtered by: {selectedGroup.name}
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredPatients.length} patients
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by patient ID, medications, or conditions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demographics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comorbidities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const riskLevel = getRiskLevel(patient.riskScore);
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600">
                        {patient.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{patient.age}y, {patient.sex}</div>
                          <div className="text-gray-500">{patient.race}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {patient.riskScore.toFixed(3)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskLevel.color}`}>
                            {riskLevel.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {patient.medications.slice(0, 3).map((med, idx) => (
                            <div key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                              {med}
                            </div>
                          ))}
                          {patient.medications.length > 3 && (
                            <div className="inline-block text-xs text-gray-500">
                              +{patient.medications.length - 3} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {patient.comorbidities.slice(0, 2).map((cond, idx) => (
                            <div key={idx} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1">
                              {cond}
                            </div>
                          ))}
                          {patient.comorbidities.length > 2 && (
                            <div className="inline-block text-xs text-gray-500">
                              +{patient.comorbidities.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {patient.predictedEvents.slice(0, 2).map((event, idx) => (
                            <div key={idx} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-1">
                              {event}
                            </div>
                          ))}
                          {patient.predictedEvents.length > 2 && (
                            <div className="inline-block text-xs text-gray-500">
                              +{patient.predictedEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.lastUpdated).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No patients available in this group.'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredPatients.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredPatients.length}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredPatients.filter(p => p.riskScore >= 0.7).length}
              </div>
              <div className="text-sm text-gray-500">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredPatients.filter(p => p.riskScore >= 0.3 && p.riskScore < 0.7).length}
              </div>
              <div className="text-sm text-gray-500">Medium Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredPatients.filter(p => p.riskScore < 0.3).length}
              </div>
              <div className="text-sm text-gray-500">Low Risk</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 