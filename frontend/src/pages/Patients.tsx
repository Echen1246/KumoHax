import React from 'react';

const mockPatients = [
  { id: 'P-1001', age: 72, sex: 'F', race: 'White', risks: ['A', 'B'], riskScore: 0.84 },
  { id: 'P-1002', age: 28, sex: 'M', race: 'Asian', risks: ['A', 'C'], riskScore: 0.33 },
  { id: 'P-1003', age: 55, sex: 'M', race: 'Black', risks: ['B', 'C'], riskScore: 0.58 },
];

export const PatientsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Patients</h2>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Sex</th>
              <th className="px-4 py-2">Race</th>
              <th className="px-4 py-2">Risks</th>
              <th className="px-4 py-2">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {mockPatients.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-mono">{p.id}</td>
                <td className="px-4 py-2">{p.age}</td>
                <td className="px-4 py-2">{p.sex}</td>
                <td className="px-4 py-2">{p.race}</td>
                <td className="px-4 py-2">{p.risks.join(', ')}</td>
                <td className="px-4 py-2">{p.riskScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 