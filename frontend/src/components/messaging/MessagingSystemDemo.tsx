import React, { useState } from 'react';
import { MessagingSystem } from './MessagingSystem';
import { toast } from 'react-hot-toast';

export default function MessagingSystemDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoStart = () => {
    setShowDemo(true);
    toast.success('Messaging system demo started!');
  };

  const handleDemoStop = () => {
    setShowDemo(false);
    toast.success('Demo stopped');
  };

  if (showDemo) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-full">
          <MessagingSystem />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Messaging System Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This demo showcases the comprehensive messaging system including:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Real-time chat with WebSocket integration
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              File sharing with drag & drop support
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Message threading and organization
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Advanced search and filtering
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Typing indicators and read receipts
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Conversation management and statistics
            </li>
          </ul>
        </div>

        {/* Demo Controls */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Demo Controls
            </h2>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDemoStart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Messaging Demo
              </button>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to launch the full messaging system interface
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💬 Real-Time Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Instant messaging with WebSocket support, typing indicators, 
              and read receipts for seamless communication.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📎 File Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Drag & drop file uploads with progress tracking, 
              preview support, and organized file management.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🧵 Message Threading
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Organized conversation threads for better discussion 
              management and context preservation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🔍 Advanced Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Powerful search with filters, date ranges, and 
              relevance scoring for finding messages quickly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📊 Analytics Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Comprehensive statistics and conversation overview 
              for monitoring messaging activity and engagement.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ⚡ Performance Optimized
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Efficient message loading, real-time updates, and 
              responsive design for optimal user experience.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Frontend Architecture
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• React functional components with TypeScript</li>
                <li>• Custom hooks for state management</li>
                <li>• WebSocket integration for real-time updates</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• Dark mode support throughout</li>
                <li>• Accessibility features and keyboard navigation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Backend Integration
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• RESTful API endpoints for CRUD operations</li>
                <li>• WebSocket server for real-time communication</li>
                <li>• File upload and storage management</li>
                <li>• Message threading and organization</li>
                <li>• Search indexing and query optimization</li>
                <li>• User authentication and authorization</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Key Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div>• Real-time messaging</div>
              <div>• File attachments</div>
              <div>• Message threading</div>
              <div>• Advanced search</div>
              <div>• Typing indicators</div>
              <div>• Read receipts</div>
              <div>• Conversation management</div>
              <div>• Analytics dashboard</div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-md font-medium text-blue-900 dark:text-blue-100 mb-2">
                Starting a Conversation
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Select a conversation from the sidebar to begin chatting. 
                The system automatically loads recent messages and shows typing indicators.
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-md font-medium text-green-900 dark:text-green-100 mb-2">
                File Sharing
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Drag and drop files into the chat area or use the file attachment button. 
                Supported formats include images, videos, documents, and spreadsheets.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-md font-medium text-purple-900 dark:text-purple-100 mb-2">
                Message Threading
              </h3>
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Reply to specific messages to create organized threads. 
                Navigate between threads using the dedicated threads tab.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-md font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Advanced Search
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Use the search tab to find messages by content, sender, date, or type. 
                Apply filters and sort results by relevance or date.
              </p>
            </div>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Browser Compatibility
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Supported Browsers
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Chrome 88+ (Full support)</li>
                <li>• Firefox 85+ (Full support)</li>
                <li>• Safari 14+ (Full support)</li>
                <li>• Edge 88+ (Full support)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Required Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• WebSocket support</li>
                <li>• File API support</li>
                <li>• Drag & drop support</li>
                <li>• Modern CSS features</li>
                <li>• ES6+ JavaScript</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
