import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectPath = '/login' 
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector(state => state.auth);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If role is required, check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute;
