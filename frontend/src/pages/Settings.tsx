import React from 'react';

export const SettingsPage: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm text-gray-600">API Base URL</div>
        <div className="font-mono text-sm">{apiBase}</div>
      </div>
      <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
        Realtime via SSE at `{apiBase}/events/alerts`.
      </div>
    </div>
  );
}; 