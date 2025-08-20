import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { protectedRoutes, publicRoutes, flattenRoutes } from '@/routes/routes.config';

export const useRoutes = () => {
  const location = useLocation();

  // Get current route information
  const currentRoute = useMemo(() => {
    const allRoutes = [...protectedRoutes, ...publicRoutes];
    const flattened = flattenRoutes(allRoutes);
    
    return flattened.find(route => route.path === location.pathname);
  }, [location.pathname]);

  // Check if current route is protected
  const isProtectedRoute = useMemo(() => {
    return currentRoute?.protected || false;
  }, [currentRoute]);

  // Get required roles for current route
  const requiredRoles = useMemo(() => {
    return currentRoute?.requiredRoles || [];
  }, [currentRoute]);

  // Get breadcrumb data for current route
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbData = [{ label: 'Home', path: '/dashboard' }];
    
    let currentPath = '';
    const allRoutes = [...protectedRoutes, ...publicRoutes];
    const flattened = flattenRoutes(allRoutes);
    
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Find route for this path
      const route = flattened.find(r => r.path === currentPath);
      
      if (route) {
        // Convert segment to readable label
        let label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Handle special cases
        const labelMap: Record<string, string> = {
          'dashboard': 'Dashboard',
          'quotations': 'Quotations',
          'clients': 'Clients',
          'analytics': 'Analytics',
          'files': 'Files',
          'settings': 'Settings',
          'create': 'Create New',
          'templates': 'Templates',
          'profile': 'Profile',
          'company': 'Company',
          'notifications': 'Notifications',
          'integrations': 'Integrations',
          'reports': 'Reports',
          'export': 'Export Data'
        };
        
        label = labelMap[segment] || label;
        
        breadcrumbData.push({
          label,
          path: currentPath
        });
      }
    });
    
    return breadcrumbData;
  }, [location.pathname]);

  // Get navigation menu items with active states
  const navigationItems = useMemo(() => {
    const items = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        isActive: location.pathname === '/dashboard'
      },
      {
        id: 'quotations',
        label: 'Quotations',
        path: '/quotations',
        isActive: location.pathname.startsWith('/quotations'),
        children: [
          { id: 'quotations-list', label: 'All Quotations', path: '/quotations' },
          { id: 'quotations-create', label: 'Create New', path: '/quotations/create' },
          { id: 'quotations-templates', label: 'Templates', path: '/quotations/templates' }
        ]
      },
      {
        id: 'clients',
        label: 'Clients',
        path: '/clients',
        isActive: location.pathname.startsWith('/clients'),
        children: [
          { id: 'clients-list', label: 'All Clients', path: '/clients' },
          { id: 'clients-create', label: 'Add Client', path: '/clients/create' }
        ]
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/analytics',
        isActive: location.pathname.startsWith('/analytics'),
        children: [
          { id: 'analytics-overview', label: 'Overview', path: '/analytics' },
          { id: 'analytics-reports', label: 'Reports', path: '/analytics/reports' },
          { id: 'analytics-export', label: 'Export Data', path: '/analytics/export' }
        ]
      },
      {
        id: 'files',
        label: 'Files',
        path: '/files',
        isActive: location.pathname === '/files'
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        isActive: location.pathname.startsWith('/settings'),
        children: [
          { id: 'settings-profile', label: 'Profile', path: '/settings/profile' },
          { id: 'settings-company', label: 'Company', path: '/settings/company' },
          { id: 'settings-notifications', label: 'Notifications', path: '/settings/notifications' },
          { id: 'settings-integrations', label: 'Integrations', path: '/settings/integrations' }
        ]
      }
    ];
    
    return items;
  }, [location.pathname]);

  // Check if user can access a specific route
  const canAccessRoute = (routePath: string, userRoles: string[] = []) => {
    const route = flattenRoutes(protectedRoutes).find(r => r.path === routePath);
    
    if (!route) return false;
    if (!route.protected) return true;
    if (!route.requiredRoles || route.requiredRoles.length === 0) return true;
    
    return route.requiredRoles.some(role => userRoles.includes(role));
  };

  return {
    currentRoute,
    isProtectedRoute,
    requiredRoles,
    breadcrumbs,
    navigationItems,
    canAccessRoute
  };
};
