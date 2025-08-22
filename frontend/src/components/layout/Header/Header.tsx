import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  BellIcon, 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ui';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Devis en Ligne
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex ml-10 space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/phases"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Phase Management
              </Link>
              <Link
                to="/demo"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                UI Demo
              </Link>
            </nav>
          </div>

          {/* Right side - Theme toggle, notifications, user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" variant="ghost" />
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <BellIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                              !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName || 'User'}
                </span>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <Cog6ToothIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/phases"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Phase Management</span>
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
