import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';
import RouteGuard from './RouteGuard';
import PublicRoute from './PublicRoute';

// Lazy load page components
const Dashboard = React.lazy(() => import('@/pages/Dashboard/Dashboard'));
const Quotations = React.lazy(() => import('@/pages/Quotations/Quotations'));
const QuotationCreate = React.lazy(() => import('@/pages/Quotations/QuotationCreate/QuotationCreate'));
const QuotationTemplates = React.lazy(() => import('@/pages/Quotations/QuotationTemplates/QuotationTemplates'));
const Clients = React.lazy(() => import('@/pages/Clients/Clients'));
const ClientCreate = React.lazy(() => import('@/pages/Clients/ClientCreate/ClientCreate'));
const Analytics = React.lazy(() => import('@/pages/Analytics/Analytics'));
const AnalyticsReports = React.lazy(() => import('@/pages/Analytics/AnalyticsReports/AnalyticsReports'));
const AnalyticsExport = React.lazy(() => import('@/pages/Analytics/AnalyticsExport/AnalyticsExport'));
const Files = React.lazy(() => import('@/pages/Files/Files'));
const Settings = React.lazy(() => import('@/pages/Settings/Settings'));
const Profile = React.lazy(() => import('@/pages/Settings/Profile/Profile'));
const Company = React.lazy(() => import('@/pages/Settings/Company/Company'));
const Notifications = React.lazy(() => import('@/pages/Settings/Notifications/Notifications'));
const Integrations = React.lazy(() => import('@/pages/Settings/Integrations/Integrations'));
const DemoLayout = React.lazy(() => import('@/pages/DemoLayout/DemoLayout'));
const Login = React.lazy(() => import('@/pages/Auth/Login/Login'));
const Register = React.lazy(() => import('@/pages/Auth/Register/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/Auth/ForgotPassword/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/Auth/ResetPassword/ResetPassword'));
const NotFound = React.lazy(() => import('@/pages/Error/NotFound/NotFound'));

// Loading component for lazy routes
const RouteLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
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
          path="/quotations/templates"
          element={
            <RouteGuard requiredRoles={['admin', 'manager']}>
              <QuotationTemplates />
            </RouteGuard>
          }
        />

        {/* Clients Routes */}
        <Route
          path="/clients"
          element={
            <RouteGuard>
              <Clients />
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
        <Route
          path="/analytics/reports"
          element={
            <RouteGuard requiredRoles={['admin', 'manager']}>
              <AnalyticsReports />
            </RouteGuard>
          }
        />
        <Route
          path="/analytics/export"
          element={
            <RouteGuard requiredRoles={['admin', 'manager']}>
              <AnalyticsExport />
            </RouteGuard>
          }
        />

        {/* Files Route */}
        <Route
          path="/files"
          element={
            <RouteGuard>
              <Files />
            </RouteGuard>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings"
          element={
            <RouteGuard>
              <Settings />
            </RouteGuard>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <RouteGuard>
              <Profile />
            </RouteGuard>
          }
        />
        <Route
          path="/settings/company"
          element={
            <RouteGuard requiredRoles={['admin', 'manager']}>
              <Company />
            </RouteGuard>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <RouteGuard>
              <Notifications />
            </RouteGuard>
          }
        />
        <Route
          path="/settings/integrations"
          element={
            <RouteGuard requiredRoles={['admin']}>
              <Integrations />
            </RouteGuard>
          }
        />

        {/* Demo Route (for development) */}
        <Route
          path="/demo"
          element={
            <RouteGuard>
              <DemoLayout />
            </RouteGuard>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
