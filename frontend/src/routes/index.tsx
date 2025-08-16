import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginPage } from '../components/auth/LoginPage';
import { DashboardPage } from '../pages/Dashboard';
import { PatientsPage } from '../pages/Patients';
import { AlertsPage } from '../pages/Alerts';
import { SettingsPage } from '../pages/Settings';

// Simple auth check (can be enhanced later)
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all - redirect to dashboard or login */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated() ? "/" : "/login"} replace />
        } 
      />
    </Routes>
  );
}; 