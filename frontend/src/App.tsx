import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/Provider';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalStyles from './styles/global';
import Layout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import UIDemo from './pages/Demo/UIDemo';
import PhaseDashboard from './pages/PhaseManagement/PhaseDashboard';
import CalendarDashboard from './pages/Calendar/CalendarDashboard';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/Auth';
import { Unauthorized } from './pages/Error';
import { Profile } from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <GlobalStyles />
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } />
                <Route path="/reset-password" element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/demo" element={
                  <ProtectedRoute>
                    <Layout>
                      <UIDemo />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/phases" element={
                  <ProtectedRoute>
                    <Layout>
                      <PhaseDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <Layout>
                      <CalendarDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={
                  <Navigate to="/dashboard" replace />
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
