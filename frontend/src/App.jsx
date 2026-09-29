import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DisasterProvider } from './context/DisasterContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CaseDetailsView from './pages/CaseDetailsView';

// Citizen Pages
import CitizenDashboard from './pages/Citizen/CitizenDashboard';
import ReportProblem from './pages/Citizen/ReportProblem';
import CitizenReports from './pages/Citizen/CitizenReports';
import CaseTracking from './pages/Citizen/CaseTracking';

// Department Pages
import DepartmentDashboard from './pages/Department/DepartmentDashboard';
import PriorityQueue from './pages/Department/PriorityQueue';
import TaskDetails from './pages/Department/TaskDetails';
import DepartmentDependencies from './pages/Department/DepartmentDependencies';

// Command Center Pages
import CommandDashboard from './pages/CommandCenter/CommandDashboard';
import LiveIncidents from './pages/CommandCenter/LiveIncidents';
import CommandMap from './pages/CommandCenter/CommandMap';
import DisasterCenter from './pages/CommandCenter/DisasterCenter';
import HandoffCenter from './pages/CommandCenter/HandoffCenter';
import EscalationCenter from './pages/CommandCenter/EscalationCenter';
import AnalyticsCenter from './pages/CommandCenter/AnalyticsCenter';
import AuditTrail from './pages/CommandCenter/AuditTrail';

// Admin Page
import AdminDashboard from './pages/Admin/AdminDashboard';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Verifying security credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific portal, navigate to their allowed portal
    if (user.role === 'citizen') return <Navigate to="/citizen" replace />;
    if (user.role === 'department') return <Navigate to="/department" replace />;
    if (user.role === 'command_center' || user.role === 'admin') return <Navigate to="/command" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Gatekeeper for Root '/' route: Redirects to role dashboard if logged in, or /login if not
const RootAuthGate = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Verifying security credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'citizen') return <Navigate to="/citizen" replace />;
  if (user.role === 'department') return <Navigate to="/department" replace />;
  if (user.role === 'command_center' || user.role === 'admin') return <Navigate to="/command" replace />;
  return <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DisasterProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Entry route: only accessible after login */}
                <Route path="/" element={<RootAuthGate />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/cases/:id"
                  element={
                    <ProtectedRoute>
                      <CaseDetailsView />
                    </ProtectedRoute>
                  }
                />

                {/* Citizen Routes */}
                <Route
                  path="/citizen"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/report"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <ReportProblem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/cases"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/track/:caseId"
                  element={
                    <ProtectedRoute allowedRoles={['citizen', 'command_center', 'admin']}>
                      <CaseTracking />
                    </ProtectedRoute>
                  }
                />

                {/* Department Routes */}
                <Route
                  path="/department"
                  element={
                    <ProtectedRoute allowedRoles={['department']}>
                      <DepartmentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/queue"
                  element={
                    <ProtectedRoute allowedRoles={['department']}>
                      <PriorityQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/task/:id"
                  element={
                    <ProtectedRoute allowedRoles={['department', 'command_center', 'admin']}>
                      <TaskDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/dependencies"
                  element={
                    <ProtectedRoute allowedRoles={['department', 'command_center', 'admin']}>
                      <DepartmentDependencies />
                    </ProtectedRoute>
                  }
                />

                {/* Command Center Routes */}
                <Route
                  path="/command"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <CommandDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/incidents"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <LiveIncidents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/map"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <CommandMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/disaster"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <DisasterCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/handoffs"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <HandoffCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/escalations"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <EscalationCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <AnalyticsCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command/audit"
                  element={
                    <ProtectedRoute allowedRoles={['command_center', 'admin']}>
                      <AuditTrail />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </DisasterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
