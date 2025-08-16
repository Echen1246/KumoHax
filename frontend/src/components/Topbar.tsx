import React, { useState } from 'react';
import { GroupSelector, Group } from './GroupSelector';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  selectedGroup: Group | null;
  onGroupChange: (group: Group) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ selectedGroup, onGroupChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side - Group Selector */}
        <div className="flex items-center space-x-4">
          <GroupSelector
            selectedGroup={selectedGroup}
            onGroupChange={onGroupChange}
          />
        </div>

        {/* Right side - Search and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-64 pl-10 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {userEmail.split('@')[0]}
              </span>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{userEmail.split('@')[0]}</div>
                    <div className="text-gray-500">{userEmail}</div>
                  </div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Notifications
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    System Settings
                  </a>
                  <div className="border-t">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backdrop */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 