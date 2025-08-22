import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  UserPlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShareIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Quote, QuoteCollaboration, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface QuoteCollaborationProps {
  quoteId: string;
  onCollaborationUpdate?: (collaborations: QuoteCollaboration[]) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export const QuoteCollaboration: React.FC<QuoteCollaborationProps> = ({
  quoteId,
  onCollaborationUpdate,
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [collaborations, setCollaborations] = useState<QuoteCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<QuoteCollaboration | null>(null);
  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor' | 'approver' | 'admin',
    permissions: {
      view: true,
      edit: false,
      approve: false,
      delete: false,
      share: false,
    },
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (quoteId) {
      loadCollaborationData();
    }
  }, [quoteId]);

  const loadCollaborationData = async () => {
    setIsLoading(true);
    try {
      const [quoteData, collaborationsData] = await Promise.all([
        quoteManagementService.getQuote(quoteId),
        quoteManagementService.getQuoteCollaborators(quoteId),
      ]);
      
      setQuote(quoteData);
      setCollaborations(collaborationsData);
      
      if (onCollaborationUpdate) {
        onCollaborationUpdate(collaborationsData);
      }
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
      toast.error('Failed to load collaboration data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // This would typically come from a user management service
      // For now, we'll simulate with mock data
      const mockUsers: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Analyst' },
      ];
      
      setAvailableUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load available users:', error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const collaboratorData = {
        userId: 'temp-user-id', // This would be resolved from email
        userEmail: newCollaborator.email,
        userName: 'New User', // This would be resolved from email
        role: newCollaborator.role,
        permissions: newCollaborator.permissions,
        addedAt: new Date(),
        lastAccess: new Date(),
        isActive: true,
      };

      const newCollaboration = await quoteManagementService.addCollaborator(quoteId, collaboratorData);
      
      setCollaborations(prev => [...prev, newCollaboration]);
      setShowAddCollaborator(false);
      setNewCollaborator({
        email: '',
        role: 'viewer',
        permissions: {
          view: true,
          edit: false,
          approve: false,
          delete: false,
          share: false,
        },
      });
      
      if (onCollaborationUpdate) {
        onCollaborationUpdate([...collaborations, newCollaboration]);
      }
      
      toast.success('Collaborator added successfully');
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      toast.error('Failed to add collaborator');
    }
  };

  const handleUpdateCollaborator = async (collaboratorId: string, updates: Partial<QuoteCollaboration>) => {
    try {
      const updatedCollaboration = await quoteManagementService.updateCollaborator(
        quoteId,
        collaboratorId,
        updates
      );
      
      setCollaborations(prev => 
        prev.map(c => c.id === collaboratorId ? updatedCollaboration : c)
      );
      
      if (onCollaborationUpdate) {
        onCollaborationUpdate(collaborations.map(c => c.id === collaboratorId ? updatedCollaboration : c));
      }
      
      setShowPermissionModal(false);
      setSelectedCollaborator(null);
      
      toast.success('Collaborator permissions updated');
    } catch (error) {
      console.error('Failed to update collaborator:', error);
      toast.error('Failed to update collaborator permissions');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      await quoteManagementService.removeCollaborator(quoteId, collaboratorId);
      
      setCollaborations(prev => prev.filter(c => c.id !== collaboratorId));
      
      if (onCollaborationUpdate) {
        onCollaborationUpdate(collaborations.filter(c => c.id !== collaboratorId));
      }
      
      toast.success('Collaborator removed successfully');
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    if (!selectedCollaborator) return;
    
    setSelectedCollaborator(prev => prev ? {
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    } : null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'approver': return 'purple';
      case 'editor': return 'blue';
      case 'viewer': return 'green';
      default: return 'gray';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <CogIcon className="h-4 w-4" />;
      case 'approver': return <CheckIcon className="h-4 w-4" />;
      case 'editor': return <PencilIcon className="h-4 w-4" />;
      case 'viewer': return <EyeIcon className="h-4 w-4" />;
      default: return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const getPermissionIcon = (permission: string, hasPermission: boolean) => {
    if (hasPermission) {
      return <CheckIcon className="h-4 w-4 text-green-500" />;
    }
    return <XMarkIcon className="h-4 w-4 text-red-500" />;
  };

  const filteredCollaborations = collaborations.filter(collaboration =>
    collaboration.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaboration.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaboration.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading collaboration data...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quote Collaboration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team access and permissions for quote #{quote.quotationNumber}
          </p>
        </div>
        
        <Button onClick={() => setShowAddCollaborator(true)}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Collaborator
        </Button>
      </div>

      {/* Collaboration Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{collaborations.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Collaborators</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {collaborations.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {collaborations.filter(c => c.role === 'approver' || c.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approvers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {collaborations.filter(c => c.role === 'editor').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Editors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search collaborators by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value="all"
              onChange={() => {}}
              className="w-40"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="approver">Approver</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCollaborations.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No collaborators found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCollaborations.map((collaboration) => (
                <div key={collaboration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {collaboration.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {collaboration.userName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collaboration.userEmail}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" color={getRoleColor(collaboration.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(collaboration.role)}
                              <span className="capitalize">{collaboration.role}</span>
                            </div>
                          </Badge>
                          
                          {collaboration.isActive ? (
                            <Badge variant="outline" color="green">Active</Badge>
                          ) : (
                            <Badge variant="outline" color="gray">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCollaborator(collaboration);
                          setShowPermissionModal(true);
                        }}
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collaboration.id)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Permissions Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Permissions
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {Object.entries(collaboration.permissions).map(([permission, hasPermission]) => (
                        <div key={permission} className="flex items-center space-x-2 text-sm">
                          {getPermissionIcon(permission, hasPermission)}
                          <span className="capitalize">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Activity Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Added: {new Date(collaboration.addedAt).toLocaleDateString()}</span>
                      <span>Last access: {new Date(collaboration.lastAccess).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Collaborator Modal */}
      {showAddCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Collaborator
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <Select
                  value={newCollaborator.role}
                  onChange={(e) => setNewCollaborator(prev => ({ 
                    ...prev, 
                    role: e.target.value as any,
                    permissions: getDefaultPermissions(e.target.value as any)
                  }))}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="approver">Approver</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {Object.entries(newCollaborator.permissions).map(([permission, hasPermission]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission}
                        checked={hasPermission}
                        onChange={(e) => setNewCollaborator(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [permission]: e.target.checked,
                          },
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={permission} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddCollaborator(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCollaborator}>
                Add Collaborator
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Manage Permissions
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Managing permissions for <strong>{selectedCollaborator.userName}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <Select
                  value={selectedCollaborator.role}
                  onChange={(e) => setSelectedCollaborator(prev => prev ? {
                    ...prev,
                    role: e.target.value as any,
                    permissions: getDefaultPermissions(e.target.value as any)
                  } : null)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="approver">Approver</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {Object.entries(selectedCollaborator.permissions).map(([permission, hasPermission]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-${permission}`}
                        checked={hasPermission}
                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`edit-${permission}`} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowPermissionModal(false)}>
                Cancel
 </Button>
              <Button onClick={() => handleUpdateCollaborator(selectedCollaborator.id, {
                role: selectedCollaborator.role,
                permissions: selectedCollaborator.permissions,
              })}>
                Update Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get default permissions based on role
const getDefaultPermissions = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        view: true,
        edit: true,
        approve: true,
        delete: true,
        share: true,
      };
    case 'approver':
      return {
        view: true,
        edit: true,
        approve: true,
        delete: false,
        share: true,
      };
    case 'editor':
      return {
        view: true,
        edit: true,
        approve: false,
        delete: false,
        share: false,
      };
    case 'viewer':
    default:
      return {
        view: true,
        edit: false,
        approve: false,
        delete: false,
        share: false,
      };
  }
};
