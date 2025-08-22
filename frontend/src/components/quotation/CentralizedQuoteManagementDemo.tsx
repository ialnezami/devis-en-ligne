import React, { useState } from 'react';
import { CentralizedQuoteManagement } from './CentralizedQuoteManagement';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CentralizedQuoteManagementDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const handleQuoteSelect = (quote: any) => {
    console.log('Quote selected:', quote);
  };

  const handleQuoteEdit = (quote: any) => {
    console.log('Quote edit requested:', quote);
  };

  const handleQuoteDelete = (quote: any) => {
    console.log('Quote delete requested:', quote);
  };

  const handleExportData = (data: any, format: string) => {
    console.log('Export data:', { data, format });
    // In a real app, this would trigger the actual export
  };

  if (!showDemo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Centralized Quote Management Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the comprehensive quote management system with advanced features including 
              repository management, lifecycle tracking, analytics, team collaboration, and backup recovery.
            </p>
          </div>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Centralized Repository
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced search, filtering, and organization for all your quotes in one place.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Lifecycle Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete version control and status management throughout the quote lifecycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive insights and performance metrics for data-driven decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Team Collaboration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Role-based permissions and seamless team coordination on quotes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💾</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Backup & Recovery
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Secure backup management and point-in-time recovery capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Bulk Operations
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Efficiently manage multiple quotes with bulk actions and automation.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demo Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <span>Demo Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🚀 Getting Started
                  </h4>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>• Click "Launch Demo" to experience the full system</li>
                    <li>• Navigate between different tabs to explore features</li>
                    <li>• Use the repository to browse and select quotes</li>
                    <li>• Explore analytics, collaboration, and backup features</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    ✨ Key Features to Explore
                  </h4>
                  <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                    <li>• <strong>Repository:</strong> Advanced search, filtering, and bulk operations</li>
                    <li>• <strong>Lifecycle:</strong> Version control and status management</li>
                    <li>• <strong>Analytics:</strong> Performance metrics and trend analysis</li>
                    <li>• <strong>Collaboration:</strong> Team permissions and access control</li>
                    <li>• <strong>Backup:</strong> Data protection and recovery options</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    ⚠️ Demo Mode
                  </h4>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    This is a demonstration environment. All data is simulated and no actual 
                    quotes will be created, modified, or deleted. The system showcases the 
                    complete user interface and interaction patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Demo Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 text-lg"
            >
              🚀 Launch Centralized Quote Management Demo
            </Button>
          </div>

          {/* System Requirements */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>System Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Frontend</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• React 18+ with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Heroicons for iconography</li>
                    <li>• React Hot Toast for notifications</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Backend Integration</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• RESTful API endpoints</li>
                    <li>• JWT authentication</li>
                    <li>• Real-time data synchronization</li>
                    <li>• File upload and management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" color="green" className="flex items-center space-x-1">
                <CheckCircleIcon className="h-3 w-3" />
                <span>Demo Mode</span>
              </Badge>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Centralized Quote Management System
              </h2>
            </div>
            
            <Button variant="outline" onClick={() => setShowDemo(false)}>
              Exit Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CentralizedQuoteManagement
          onQuoteSelect={handleQuoteSelect}
          onQuoteEdit={handleQuoteEdit}
          onQuoteDelete={handleQuoteDelete}
          onExportData={handleExportData}
        />
      </div>

      {/* Demo Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                This is a demonstration environment
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All data is simulated and no actual quotes will be modified. 
              The system showcases the complete user interface and interaction patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
