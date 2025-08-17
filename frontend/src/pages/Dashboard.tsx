import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';
import { RiskTrendChart } from '../components/charts/RiskTrendChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';
import { Group } from '../components/GroupSelector';
import { apiClient } from '../lib/api';

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
  severity: string;
}

interface LayoutContext {
  selectedGroup: Group | null;
  onGroupChange: (group: Group) => void;
}

export const DashboardPage: React.FC = () => {
  const { selectedGroup } = useOutletContext<LayoutContext>();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trendData, setTrendData] = useState<RiskTrendData[]>([]);
  const [distributionData, setDistributionData] = useState<RiskDistributionData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [metricsRes, trendsRes, distributionRes, alertsRes] = await Promise.all([
          apiClient.get('/dashboard/metrics'),
          apiClient.get('/dashboard/risk-trends'),
          apiClient.get('/dashboard/risk-distribution'),
          apiClient.get('/alerts/recent')
        ]);

        setMetrics(metricsRes.data);
        setTrendData(trendsRes.data);
        setDistributionData(distributionRes.data);
        setRecentAlerts(alertsRes.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection to the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedGroup]); // Refetch when group changes

  // Set up real-time alerts via SSE
  useEffect(() => {
    // Setup real-time alerts  
    const eventSource = new EventSource('/api/events/alerts');
    
    eventSource.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        if (alert.type === 'kumorfm_alert') {
          setRecentAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep latest 10 alerts
        }
      } catch (err) {
        console.error('Error parsing SSE alert:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data from Kumo RFM...</p>
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
          <span className="text-red-800 font-medium">Error loading dashboard</span>
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

  if (!metrics) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Adverse Event Risk Monitor
          </h1>
          <p className="text-gray-600">
            Real-time patient risk assessment powered by Kumo RFM
            {selectedGroup && selectedGroup.id !== 'all' && (
              <span className="ml-2 text-blue-600">
                • Filtered by: {selectedGroup.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live monitoring active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Patients"
          value={metrics.totalPatients.toLocaleString()}
          icon={
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts.toString()}
          trend={{ value: Math.abs(metrics.alertsTrend), isPositive: metrics.alertsTrend < 0 }}
          icon={
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <MetricCard
          title="High-Risk Patients"
          value={metrics.highRiskPatients.toString()}
          trend={{ value: Math.abs(metrics.riskTrend), isPositive: metrics.riskTrend < 0 }}
          icon={
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <MetricCard
          title="Avg. Risk Score"
          value={metrics.averageRiskScore.toFixed(3)}
          trend={{ value: Math.abs(metrics.riskTrend), isPositive: metrics.riskTrend > 0 }}
          icon={
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {trendData.length > 0 ? (
            <RiskTrendChart data={trendData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No trend data available
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Distribution
          </h3>
          {distributionData.length > 0 ? (
            <RiskDistributionChart data={distributionData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No distribution data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent High-Priority Alerts</h3>
          <p className="text-sm text-gray-600 mt-1">Live updates from Kumo RFM risk predictions</p>
        </div>
        <div className="p-6">
          {recentAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
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
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
              <p className="mt-1 text-sm text-gray-500">No recent high-priority alerts from Kumo RFM.</p>
            </div>
          )}
        </div>
      </div>

      {/* Kumo RFM Integration Status */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-900">Kumo RFM Integration Active</h4>
            <p className="text-sm text-green-700">
              Successfully connected to Kumo RFM API. Real-time adverse event prediction and risk modeling is active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 