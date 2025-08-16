import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RiskTrendData {
  date: string;
  averageRisk: number;
  highRiskPatients: number;
  alertsCount: number;
}

interface RiskTrendChartProps {
  data: RiskTrendData[];
  height?: number;
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ 
  data, 
  height = 300 
}) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis yAxisId="risk" orientation="left" domain={[0, 1]} />
          <YAxis yAxisId="count" orientation="right" />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [
              name === 'averageRisk' ? value.toFixed(3) : value,
              name === 'averageRisk' ? 'Avg Risk Score' :
              name === 'highRiskPatients' ? 'High-Risk Patients' : 'Alerts'
            ]}
          />
          <Legend />
          <Line
            yAxisId="risk"
            type="monotone"
            dataKey="averageRisk"
            stroke="#ef4444"
            strokeWidth={2}
            name="Average Risk Score"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="highRiskPatients"
            stroke="#f59e0b"
            strokeWidth={2}
            name="High-Risk Patients"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="alertsCount"
            stroke="#dc2626"
            strokeWidth={2}
            name="Alerts"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 