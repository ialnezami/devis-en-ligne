import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface UserRoleManagementProps {
  onSettingsChange: () => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function UserRoleManagement({ onSettingsChange }: UserRoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('roles');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock permissions data
      const mockPermissions: Permission[] = [
        // User Management
        { id: 'users.view', name: 'View Users', description: 'Can view user profiles and lists', category: 'User Management' },
        { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts', category: 'User Management' },
        { id: 'users.edit', name: 'Edit Users', description: 'Can modify user information', category: 'User Management' },
        { id: 'users.delete', name: 'Delete Users', description: 'Can remove user accounts', category: 'User Management' },
        
        // Quote Management
        { id: 'quotes.view', name: 'View Quotes', description: 'Can view quote information', category: 'Quote Management' },
        { id: 'quotes.create', name: 'Create Quotes', description: 'Can create new quotes', category: 'Quote Management' },
        { id: 'quotes.edit', name: 'Edit Quotes', description: 'Can modify existing quotes', category: 'Quote Management' },
        { id: 'quotes.delete', name: 'Delete Quotes', description: 'Can remove quotes', category: 'Quote Management' },
        { id: 'quotes.approve', name: 'Approve Quotes', description: 'Can approve quotes for clients', category: 'Quote Management' },
        
        // Client Management
        { id: 'clients.view', name: 'View Clients', description: 'Can view client information', category: 'Client Management' },
        { id: 'clients.create', name: 'Create Clients', description: 'Can create new client records', category: 'Client Management' },
        { id: 'clients.edit', name: 'Edit Clients', description: 'Can modify client information', category: 'Client Management' },
        { id: 'clients.delete', name: 'Delete Clients', description: 'Can remove client records', category: 'Client Management' },
        
        // Settings
        { id: 'settings.view', name: 'View Settings', description: 'Can view application settings', category: 'Settings' },
        { id: 'settings.edit', name: 'Edit Settings', description: 'Can modify application settings', category: 'Settings' },
        
        // Reports
        { id: 'reports.view', name: 'View Reports', description: 'Can access reports and analytics', category: 'Reports' },
        { id: 'reports.export', name: 'Export Reports', description: 'Can export report data', category: 'Reports' },
        
        // System
        { id: 'system.admin', name: 'System Admin', description: 'Full system access and control', category: 'System' },
        { id: 'system.logs', name: 'View Logs', description: 'Can access system logs', category: 'System' }
      ];
      
      // Mock roles data
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: mockPermissions.map(p => p.id),
          isSystem: true,
          userCount: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Administrator',
          description: 'System administration with most permissions',
          permissions: mockPermissions.filter(p => !p.id.includes('system.admin')).map(p => p.id),
          isSystem: true,
          userCount: 2,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'Manager',
          description: 'Team management with quote and client access',
          permissions: [
            'users.view', 'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.approve',
            'clients.view', 'clients.create', 'clients.edit', 'reports.view', 'reports.export'
          ],
          isSystem: false,
          userCount: 5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '4',
          name: 'Sales Representative',
          description: 'Sales team member with quote creation access',
          permissions: [
            'quotes.view', 'quotes.create', 'quotes.edit', 'clients.view', 'clients.create'
          ],
          isSystem: false,
          userCount: 12,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '5',
          name: 'Viewer',
          description: 'Read-only access to basic information',
          permissions: ['quotes.view', 'clients.view', 'reports.view'],
          isSystem: false,
          userCount: 8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      
      setPermissions(mockPermissions);
      setRoles(mockRoles);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRole: Role = {
      ...role,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRoles(prev => [...prev, newRole]);
    setShowAddForm(false);
    onSettingsChange();
  };

  const handleEditRole = (role: Role) => {
    setRoles(prev => prev.map(r => r.id === role.id ? { ...role, updatedAt: new Date().toISOString() } : r));
    setEditingRole(null);
    onSettingsChange();
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      alert('System roles cannot be deleted.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(prev => prev.filter(r => r.id !== id));
      onSettingsChange();
    }
  };

  const getPermissionCategory = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission?.category || 'Unknown';
  };

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission?.name || permissionId;
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user roles and permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Role Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles, permissions, and access control
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Role
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 inline mr-2" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Permissions
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Roles Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permissionId => (
                            <span
                              key={permissionId}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {getPermissionName(permissionId)}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          role.isSystem
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingRole(role)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {permission.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {permission.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Role Form */}
      {(showAddForm || editingRole) && (
        <RoleForm
          role={editingRole}
          permissions={permissions}
          onSave={editingRole ? handleEditRole : handleAddRole}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
}

interface RoleFormProps {
  role?: Role | null;
  permissions: Permission[];
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function RoleForm({ role, permissions, onSave, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || []
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFilteredPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {role ? 'Edit Role' : 'Add New Role'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Sales Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of this role"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions *
              </label>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search permissions..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                {Object.entries(groupedFilteredPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredPermissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No permissions match your search.
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formData.permissions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {role ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
