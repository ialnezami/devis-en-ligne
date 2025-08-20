import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const DemoLayout: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Application Layout Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This page demonstrates the complete application layout including:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Responsive sidebar navigation with collapsible menu items</li>
            <li>Header with user menu, notifications, and theme toggle</li>
            <li>Breadcrumb navigation</li>
            <li>Mobile-responsive design</li>
            <li>Dark/light theme switching</li>
            <li>Proper content area with max-width container</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sidebar Features
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Dashboard navigation</li>
              <li>• Quotations management</li>
              <li>• Client management</li>
              <li>• Analytics & reports</li>
              <li>• File management</li>
              <li>• Settings & preferences</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Header Features
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Theme toggle (light/dark)</li>
              <li>• Notification center</li>
              <li>• User profile menu</li>
              <li>• Mobile menu button</li>
              <li>• Application title</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Responsive Design
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Mobile-first approach</li>
              <li>• Collapsible sidebar on mobile</li>
              <li>• Touch-friendly interactions</li>
              <li>• Adaptive navigation</li>
              <li>• Flexible content layout</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Theme System
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The application supports both light and dark themes with automatic system preference detection.
            Users can manually toggle between themes using the button in the header.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Light Theme</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Clean, bright interface with high contrast for optimal readability in well-lit environments.
              </p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Dark Theme</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Easy on the eyes with reduced blue light emission, perfect for low-light conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Navigation Features
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Breadcrumbs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dynamic breadcrumb navigation that shows the current page hierarchy and allows quick navigation to parent pages.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Menu Structure</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hierarchical menu system with expandable sections for better organization of related features.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Active States</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Visual indicators for current page and section to help users understand their location in the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoLayout;
