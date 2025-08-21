import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  useGetClientsQuery, 
  useCreateClientMutation,
  setFilters,
  clearFilters 
} from '@/store/slices/clientSlice';
import { showSuccess, showError } from '@/store/slices/notificationSlice';
import { toggleTheme, setPrimaryColor } from '@/store/slices/themeSlice';

const ReduxExample: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const theme = useAppSelector(state => state.theme);
  const notifications = useAppSelector(state => state.notifications);
  
  // RTK Query hooks
  const { data: clientsData, isLoading, error } = useGetClientsQuery({});
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  
  // Extract clients array from the response
  const clients = clientsData?.clients || [];
  
  // Example actions
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  const handleColorChange = (color: string) => {
    dispatch(setPrimaryColor(color));
  };
  
  const handleShowNotification = (type: 'success' | 'error') => {
    if (type === 'success') {
      dispatch(showSuccess({ 
        title: 'Success!', 
        message: 'This is a success notification' 
      }));
    } else {
      dispatch(showError({ 
        title: 'Error!', 
        message: 'This is an error notification' 
      }));
    }
  };
  
  const handleCreateClient = async () => {
    try {
      await createClient({
        name: 'Example Client',
        email: 'example@client.com',
        company: 'Example Corp',
        status: 'active'
      }).unwrap();
      
      dispatch(showSuccess({ 
        title: 'Client Created', 
        message: 'New client has been created successfully' 
      }));
    } catch (error) {
      dispatch(showError({ 
        title: 'Creation Failed', 
        message: 'Failed to create client' 
      }));
    }
  };
  
  const handleSetFilters = () => {
    dispatch(setFilters({ status: 'active', industry: 'technology' }));
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Redux State Management Example</h1>
      
      {/* Theme Management */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Theme Management</h2>
        <div className="space-y-2">
          <p>Current Theme: <span className="font-mono">{theme.mode}</span></p>
          <p>Dark Mode: <span className="font-mono">{theme.isDark ? 'Yes' : 'No'}</span></p>
          <p>Primary Color: <span className="font-mono">{theme.primaryColor}</span></p>
          <div className="flex gap-2">
            <button 
              onClick={handleThemeToggle}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Toggle Theme
            </button>
            <button 
              onClick={() => handleColorChange('#FF6B6B')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Red Theme
            </button>
            <button 
              onClick={() => handleColorChange('#4ECDC4')}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Teal Theme
            </button>
          </div>
        </div>
      </section>
      
      {/* Notifications */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-2">
          <p>Unread Count: <span className="font-mono">{notifications.unreadCount}</span></p>
          <p>Total Notifications: <span className="font-mono">{notifications.notifications.length}</span></p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleShowNotification('success')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Show Success
            </button>
            <button 
              onClick={() => handleShowNotification('error')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Show Error
            </button>
          </div>
        </div>
      </section>
      
      {/* Client Management */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Client Management (RTK Query)</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={handleCreateClient}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Example Client'}
            </button>
            <button 
              onClick={handleSetFilters}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Set Filters
            </button>
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
          
          {isLoading && <p className="text-blue-600">Loading clients...</p>}
          {error && <p className="text-red-600">Error: {JSON.stringify(error)}</p>}
          
          {clients && (
            <div>
              <p className="font-semibold">Clients ({clients.length}):</p>
              <ul className="list-disc list-inside space-y-1">
                {clients.slice(0, 5).map(client => (
                  <li key={client.id} className="font-mono text-sm">
                    {client.name} - {client.email}
                  </li>
                ))}
                {clients.length > 5 && (
                  <li className="text-gray-500">... and {clients.length - 5} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </section>
      
      {/* State Display */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <div className="space-y-2">
          <details className="border rounded p-2">
            <summary className="cursor-pointer font-semibold">Theme State</summary>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(theme, null, 2)}
            </pre>
          </details>
          
          <details className="border rounded p-2">
            <summary className="cursor-pointer font-semibold">Notifications State</summary>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(notifications, null, 2)}
            </pre>
          </details>
        </div>
      </section>
    </div>
  );
};

export default ReduxExample;
