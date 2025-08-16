import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Group } from './GroupSelector';

export const Layout: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Initialize with default group on mount
  useEffect(() => {
    const defaultGroup: Group = {
      id: 'all',
      name: 'All Patients',
      description: 'Complete patient population across all studies',
      patientCount: 2847,
    };
    setSelectedGroup(defaultGroup);
  }, []);

  const handleGroupChange = (group: Group) => {
    setSelectedGroup(group);
    // TODO: Fetch group-specific data and update dashboard
    console.log('Selected group:', group);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Topbar 
            selectedGroup={selectedGroup}
            onGroupChange={handleGroupChange}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet context={{ selectedGroup, onGroupChange: handleGroupChange }} />
          </main>
        </div>
      </div>
    </div>
  );
}; 