import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RiskDistributionData {
  riskCategory: string;
  patientCount: number;
  percentage: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData[];
  height?: number;
}

const COLORS = {
  'Low (0.0-0.3)': '#10b981',
  'Medium (0.3-0.7)': '#f59e0b', 
  'High (0.7-1.0)': '#ef4444',
};

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ 
  data, 
  height = 300 
}) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="riskCategory" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => [value, 'Patients']}
            labelFormatter={(label) => `Risk Category: ${label}`}
          />
          <Bar dataKey="patientCount" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell 
                key={entry.riskCategory} 
                fill={COLORS[entry.riskCategory as keyof typeof COLORS] || '#6b7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 