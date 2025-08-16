import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { RiskTrendChart } from '../components/charts/RiskTrendChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';

interface DashboardMetrics {
  totalPatients: number;
  activeAlerts: number;
  highRiskPatients: number;
  averageRiskScore: number;
  alertsTrend: number;
  riskTrend: number;
}

interface RiskTrendData {
  date: string;
  averageRisk: number;
  highRiskPatients: number;
  alertsCount: number;
}

interface RiskDistributionData {
  riskCategory: string;
  patientCount: number;
  percentage: number;
}

interface RecentAlert {
  id: string;
  patientId: string;
  riskScore: number;
  condition: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPatients: 2847,
    activeAlerts: 23,
    highRiskPatients: 127,
    averageRiskScore: 0.34,
    alertsTrend: -8.2,
    riskTrend: 2.1,
  });

  const [trendData] = useState<RiskTrendData[]>([
    { date: '2024-01-01', averageRisk: 0.31, highRiskPatients: 98, alertsCount: 15 },
    { date: '2024-01-02', averageRisk: 0.33, highRiskPatients: 112, alertsCount: 18 },
    { date: '2024-01-03', averageRisk: 0.35, highRiskPatients: 121, alertsCount: 22 },
    { date: '2024-01-04', averageRisk: 0.32, highRiskPatients: 108, alertsCount: 19 },
    { date: '2024-01-05', averageRisk: 0.34, highRiskPatients: 127, alertsCount: 23 },
  ]);

  const [distributionData] = useState<RiskDistributionData[]>([
    { riskCategory: 'Low (0.0-0.3)', patientCount: 1892, percentage: 66.4 },
    { riskCategory: 'Medium (0.3-0.7)', patientCount: 828, percentage: 29.1 },
    { riskCategory: 'High (0.7-1.0)', patientCount: 127, percentage: 4.5 },
  ]);

  const [recentAlerts] = useState<RecentAlert[]>([
    {
      id: 'A-2024-001',
      patientId: 'P-1847',
      riskScore: 0.89,
      condition: 'Hepatotoxicity Risk',
      timestamp: '2024-01-05T14:30:00Z',
      severity: 'high',
    },
    {
      id: 'A-2024-002',
      patientId: 'P-2193',
      riskScore: 0.76,
      condition: 'Cardiac Arrhythmia Risk',
      timestamp: '2024-01-05T13:45:00Z',
      severity: 'high',
    },
    {
      id: 'A-2024-003',
      patientId: 'P-1654',
      riskScore: 0.68,
      condition: 'Renal Function Decline',
      timestamp: '2024-01-05T12:20:00Z',
      severity: 'medium',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Adverse Event Risk Monitor
          </h1>
          <p className="text-gray-600">
            Real-time patient risk assessment powered by KumoRFM
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Live monitoring active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Patients"
          value={metrics.totalPatients.toLocaleString()}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          trend={{ value: metrics.alertsTrend, isPositive: false }}
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <MetricCard
          title="High-Risk Patients"
          value={metrics.highRiskPatients}
          trend={{ value: metrics.riskTrend, isPositive: false }}
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <MetricCard
          title="Avg. Risk Score"
          value={metrics.averageRiskScore.toFixed(3)}
          trend={{ value: Math.abs(metrics.riskTrend), isPositive: metrics.riskTrend > 0 }}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Trends (Last 5 Days)
          </h3>
          <RiskTrendChart data={trendData} height={300} />
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Distribution
          </h3>
          <RiskDistributionChart data={distributionData} height={300} />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent High-Priority Alerts</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alert ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {alert.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      {alert.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.riskScore.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KumoRFM Integration Status */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">KumoRFM Integration</h4>
            <p className="text-sm text-blue-700">
              Connect your KumoRFM API key in Settings to enable real-time adverse event prediction and risk modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 