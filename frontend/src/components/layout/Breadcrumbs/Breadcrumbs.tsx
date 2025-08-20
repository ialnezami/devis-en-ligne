import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/solid';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/dashboard' }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Handle special cases
      if (segment === 'dashboard') {
        label = 'Dashboard';
      } else if (segment === 'quotations') {
        label = 'Quotations';
      } else if (segment === 'clients') {
        label = 'Clients';
      } else if (segment === 'analytics') {
        label = 'Analytics';
      } else if (segment === 'files') {
        label = 'Files';
      } else if (segment === 'settings') {
        label = 'Settings';
      } else if (segment === 'create') {
        label = 'Create New';
      } else if (segment === 'templates') {
        label = 'Templates';
      } else if (segment === 'profile') {
        label = 'Profile';
      } else if (segment === 'company') {
        label = 'Company';
      } else if (segment === 'notifications') {
        label = 'Notifications';
      } else if (segment === 'integrations') {
        label = 'Integrations';
      } else if (segment === 'reports') {
        label = 'Reports';
      } else if (segment === 'export') {
        label = 'Export Data';
      }

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {breadcrumb.isActive ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center space-x-1"
              >
                {index === 0 && <HomeIcon className="h-4 w-4" />}
                <span>{breadcrumb.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
