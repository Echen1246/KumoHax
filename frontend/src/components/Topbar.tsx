import React from 'react';

export const Topbar: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Adverse Event Monitor</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search patients..."
            className="h-9 w-56 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
    </header>
  );
}; 