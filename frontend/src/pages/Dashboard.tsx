import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-3">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">Active Patients</div>
            <div className="text-2xl font-bold">1,234</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">Alerts Today</div>
            <div className="text-2xl font-bold">12</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">High-Risk Cohorts</div>
            <div className="text-2xl font-bold">4</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">Avg. Risk Score</div>
            <div className="text-2xl font-bold">0.41</div>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Alerts</h2>
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
          Connect your backend to stream live alerts via SSE at `/events/alerts`.
        </div>
      </section>
    </div>
  );
}; 