import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectPath = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or intended page
  if (isAuthenticated) {
    // Check if there's a redirect location from protected route
    const from = location.state?.from?.pathname;
    return <Navigate to={from || redirectPath} replace />;
  }

  // User is not authenticated, show public route
  return <>{children}</>;
};

export default PublicRoute;
