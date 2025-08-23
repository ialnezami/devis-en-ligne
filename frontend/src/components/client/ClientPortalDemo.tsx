import React, { useState } from 'react';
import { ClientPortal } from './ClientPortal';
import { Client } from '@/services/clientManagementService';

export default function ClientPortalDemo() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    console.log('Selected client:', client);
  };

  const handleClientEdit = (client: Client) => {
    console.log('Edit client:', client);
  };

  const handleClientDelete = (client: Client) => {
    console.log('Delete client:', client);
  };

  const handleClientDuplicate = (client: Client) => {
    console.log('Duplicate client:', client);
  };

  const handleClientShare = (client: Client) => {
    console.log('Share client:', client);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Client Portal Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This demo showcases the comprehensive client management system including:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Client list management with search and filtering
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Detailed client profiles and information
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Client communication tracking
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Activity monitoring and analytics
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Onboarding workflow management
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Document management and storage
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Quote integration and tracking
            </li>
          </ul>
        </div>

        <ClientPortal
          onClientSelect={handleClientSelect}
          onClientEdit={handleClientEdit}
          onClientDelete={handleClientDelete}
          onClientDuplicate={handleClientDuplicate}
          onClientShare={handleClientShare}
        />

        {selectedClient && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Selected Client Info
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p><strong>Company:</strong> {selectedClient.companyName}</p>
              <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Status:</strong> {selectedClient.status}</p>
              <p><strong>Priority:</strong> {selectedClient.priority}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
