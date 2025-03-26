import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Tasks from './pages/Tasks';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/layouts/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import WeeklyUpdateForm from './pages/WeeklyUpdateForm';
import TaskForm from './pages/TaskForm';
import CreateUpdatePage from './pages/CreateUpdatePage';
import WeeklyUpdateDetailsPage from './pages/WeeklyUpdateDetailsPage'; // Update import to use your existing component
import AnalyticsPage from './pages/AnalyticsPage'; // Analytics page
import TeamPage from './pages/TeamPage'; // Team page

// User Management
import Users from './pages/Users';
import UserForm from './pages/UserForm';

// Password Reset
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* User Management */}
            <Route path="users">
              <Route
                index
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <UserForm />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Projects */}
            <Route path="projects">
              <Route index element={<Projects />} />
              <Route
                path="new"
                element={
                  <ProtectedRoute requiredRole="Manager">
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />
              <Route path=":id" element={<ProjectDetail />} />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute requiredRole="Manager">
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />

              {/* Weekly Updates */}
              <Route path=":projectId/updates/new" element={<CreateUpdatePage />} />
              <Route path=":projectId/updates/:updateId/edit" element={<CreateUpdatePage />} />

              {/* Add the new route for viewing update details */}
              <Route path=":projectId/updates/:updateId" element={<WeeklyUpdateDetailsPage />} />

              {/* Tasks */}
              <Route path=":id/tasks/new" element={<TaskForm />} />
              <Route path=":id/tasks/:taskId" element={<TaskForm />} />
            </Route>

            {/* Tasks (My Tasks) */}
            <Route path="tasks" element={<Tasks />} />

            {/* Analytics Dashboard - restricted to Managers and Admins */}
            <Route
              path="analytics"
              element={
                <ProtectedRoute requiredRole="Manager">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Team Page */}
            <Route path="team" element={<TeamPage />} />

            {/* Settings Page (placeholder) */}
            <Route path="settings" element={<div className="p-8">Settings Page (Coming Soon)</div>} />
          </Route>
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;