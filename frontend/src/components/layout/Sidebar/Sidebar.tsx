import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  FolderIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  PlusIcon,
  UsersIcon,
  UserAddIcon,
  ChartPieIcon,
  DocumentReportIcon,
  DownloadIcon,
  UserIcon,
  OfficeBuildingIcon,
  BellIcon,
  XIcon,
  PuzzleIcon
} from '@heroicons/react/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);
  const { user } = useAuth();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard'
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: DocumentTextIcon,
      path: '/quotations',
      children: [
        { id: 'quotations-list', label: 'All Quotations', path: '/quotations', icon: DocumentIcon },
        { id: 'quotations-create', label: 'Create New', path: '/quotations/create', icon: PlusIcon },
        { id: 'quotations-templates', label: 'Templates', path: '/quotations/templates', icon: DocumentTextIcon }
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: UserGroupIcon,
      path: '/clients',
      children: [
        { id: 'clients-list', label: 'All Clients', path: '/clients', icon: UsersIcon },
        { id: 'clients-create', label: 'Add Client', path: '/clients/create', icon: UserAddIcon }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      path: '/analytics',
      children: [
        { id: 'analytics-overview', label: 'Overview', path: '/analytics', icon: ChartPieIcon },
        { id: 'analytics-reports', label: 'Reports', path: '/analytics/reports', icon: DocumentReportIcon },
        { id: 'analytics-export', label: 'Export Data', path: '/analytics/export', icon: DownloadIcon }
      ]
    },
    {
      id: 'files',
      label: 'Files',
      icon: FolderIcon,
      path: '/files'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      path: '/settings',
      children: [
        { id: 'settings-profile', label: 'Profile', path: '/settings/profile', icon: UserIcon },
        { id: 'settings-company', label: 'Company', path: '/settings/company', icon: OfficeBuildingIcon },
        { id: 'settings-notifications', label: 'Notifications', path: '/settings/notifications', icon: BellIcon },
        { id: 'settings-integrations', label: 'Integrations', path: '/settings/integrations', icon: PuzzleIcon }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemExpanded = (itemId: string) => expandedItems.includes(itemId);

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isItemExpanded(item.id);
    const isActive = isActiveRoute(item.path);

    return (
      <div key={item.id}>
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <Link
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map(child => (
              <Link
                key={child.id}
                to={child.path}
                onClick={onClose}
                className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                  location.pathname === child.path
                    ? 'bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" /> {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-4 px-2 space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              OQT
            </h2>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-4 px-2 space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;
