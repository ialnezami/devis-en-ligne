import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/Provider';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationCreate from './pages/Quotations/QuotationCreate';
import QuotationView from './pages/Quotations/QuotationView';
import QuotationEdit from './pages/Quotations/QuotationEdit';
import ClientList from './pages/Clients/ClientList';
import ClientCreate from './pages/Clients/ClientCreate';
import UIDemo from './pages/Demo/UIDemo';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/Auth';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public Auth Routes */}
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

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Navigate to="/dashboard" replace />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/quotations" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuotationList />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/quotations/create" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuotationCreate />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/quotations/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuotationView />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/quotations/:id/edit" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuotationEdit />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/clients" element={
                  <ProtectedRoute>
                    <Layout>
                      <ClientList />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clients/create" element={
                  <ProtectedRoute>
                    <Layout>
                      <ClientCreate />
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
                
                {/* Catch all route */}
                <Route path="*" element={
                  <Navigate to="/dashboard" replace />
                } />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
