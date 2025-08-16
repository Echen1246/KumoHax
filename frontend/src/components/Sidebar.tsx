import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'block rounded-md px-3 py-2 text-sm font-medium',
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
  );

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:block md:w-64 lg:w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <div className="text-xl font-semibold mb-6">KumoHax</div>
        <nav className="space-y-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/patients" className={linkClass}>
            Patients
          </NavLink>
          <NavLink to="/alerts" className={linkClass}>
            Alerts
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}; 