import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';
import RouteGuard from './RouteGuard';
import PublicRoute from './PublicRoute';

// Lazy load page components
const Dashboard = React.lazy(() => import('@/pages/Dashboard/Dashboard'));
const Quotations = React.lazy(() => import('@/pages/Quotations/Quotations'));
const QuotationList = React.lazy(() => import('@/pages/Quotations/QuotationList/QuotationList'));
const QuotationCreate = React.lazy(() => import('@/pages/Quotations/QuotationCreate/QuotationCreate'));
const QuotationEdit = React.lazy(() => import('@/pages/Quotations/QuotationEdit/QuotationEdit'));
const QuotationView = React.lazy(() => import('@/pages/Quotations/QuotationView/QuotationView'));
const ClientList = React.lazy(() => import('@/pages/Clients/ClientList/ClientList'));
const ClientCreate = React.lazy(() => import('@/pages/Clients/ClientCreate/ClientCreate'));
const Analytics = React.lazy(() => import('@/pages/Analytics/Analytics'));
const NotFound = React.lazy(() => import('@/pages/Error/NotFound/NotFound'));

// Loading component for lazy routes
const RouteLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <RouteLoading />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <div>Login page - Coming Soon</div>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <div>Register page - Coming Soon</div>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <div>Forgot Password page - Coming Soon</div>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <div>Reset Password page - Coming Soon</div>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <RouteGuard>
              <Navigate to="/dashboard" replace />
            </RouteGuard>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RouteGuard>
              <Dashboard />
            </RouteGuard>
          }
        />

        {/* Quotations Routes */}
        <Route
          path="/quotations"
          element={
            <RouteGuard>
              <Quotations />
            </RouteGuard>
          }
        />
        <Route
          path="/quotations/create"
          element={
            <RouteGuard requiredRoles={['admin', 'manager', 'sales_rep']}>
              <QuotationCreate />
            </RouteGuard>
          }
        />
        <Route
          path="/quotations/edit/:id"
          element={
            <RouteGuard requiredRoles={['admin', 'manager', 'sales_rep']}>
              <QuotationEdit />
            </RouteGuard>
          }
        />
        <Route
          path="/quotations/view/:id"
          element={
            <RouteGuard>
              <QuotationView />
            </RouteGuard>
          }
        />
        <Route
          path="/quotations/list"
          element={
            <RouteGuard>
              <QuotationList />
            </RouteGuard>
          }
        />

        {/* Clients Routes */}
        <Route
          path="/clients"
          element={
            <RouteGuard>
              <ClientList />
            </RouteGuard>
          }
        />
        <Route
          path="/clients/create"
          element={
            <RouteGuard requiredRoles={['admin', 'manager', 'sales_rep']}>
              <ClientCreate />
            </RouteGuard>
          }
        />

        {/* Analytics Routes */}
        <Route
          path="/analytics"
          element={
            <RouteGuard>
              <Analytics />
            </RouteGuard>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
