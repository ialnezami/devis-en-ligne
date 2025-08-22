import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {location.state?.from && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Attempted to access: {location.state.from.pathname}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Dashboard
          </Link>
          
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in with different account
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Need access?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Contact your administrator to request the necessary permissions.
          </p>
          <Link
            to="/contact"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
