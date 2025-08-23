import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PaperClipIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Client, ClientCommunication, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientCommunicationProps {
  client: Client;
  onCommunicationCreated?: (communication: ClientCommunication) => void;
  onCommunicationUpdated?: (communication: ClientCommunication) => void;
  onCommunicationDeleted?: (communicationId: string) => void;
}

export const ClientCommunication: React.FC<ClientCommunicationProps> = ({
  client,
  onCommunicationCreated,
  onCommunicationUpdated,
  onCommunicationDeleted,
}) => {
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<ClientCommunication | null>(null);
  const [viewingCommunication, setViewingCommunication] = useState<ClientCommunication | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: 'email' as const,
    subject: '',
    content: '',
    direction: 'outbound' as const,
    priority: 'medium' as const,
    scheduledDate: '',
    followUpRequired: false,
    followUpDate: '',
    tags: [] as string[],
    relatedQuoteId: '',
  });

  useEffect(() => {
    loadCommunications();
  }, [client.id]);

  const loadCommunications = async () => {
    setIsLoading(true);
    try {
      const communicationsData = await clientManagementService.getClientCommunications(client.id);
      setCommunications(communicationsData);
    } catch (error) {
      console.error('Failed to load communications:', error);
      toast.error('Failed to load communications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunication = async () => {
    try {
      const newCommunication = await clientManagementService.createClientCommunication(client.id, {
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
      });

      setCommunications(prev => [newCommunication, ...prev]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Communication created successfully');

      if (onCommunicationCreated) {
        onCommunicationCreated(newCommunication);
      }
    } catch (error) {
      console.error('Failed to create communication:', error);
      toast.error('Failed to create communication');
    }
  };

  const handleUpdateCommunication = async () => {
    if (!editingCommunication) return;

    try {
      const updatedCommunication = await clientManagementService.updateClientCommunication(
        client.id,
        editingCommunication.id,
        {
          ...formData,
          scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        }
      );

      setCommunications(prev =>
        prev.map(comm =>
          comm.id === editingCommunication.id ? updatedCommunication : comm
        )
      );

      setEditingCommunication(null);
      resetForm();
      toast.success('Communication updated successfully');

      if (onCommunicationUpdated) {
        onCommunicationUpdated(updatedCommunication);
      }
    } catch (error) {
      console.error('Failed to update communication:', error);
      toast.error('Failed to update communication');
    }
  };

  const handleDeleteCommunication = async (communicationId: string) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        await clientManagementService.deleteClientCommunication(client.id, communicationId);
        setCommunications(prev => prev.filter(comm => comm.id !== communicationId));
        toast.success('Communication deleted successfully');

        if (onCommunicationDeleted) {
          onCommunicationDeleted(communicationId);
        }
      } catch (error) {
        console.error('Failed to delete communication:', error);
        toast.error('Failed to delete communication');
      }
    }
  };

  const handleEditCommunication = (communication: ClientCommunication) => {
    setEditingCommunication(communication);
    setFormData({
      type: communication.type,
      subject: communication.subject,
      content: communication.content,
      direction: communication.direction,
      priority: communication.priority,
      scheduledDate: communication.scheduledDate ? new Date(communication.scheduledDate).toISOString().split('T')[0] : '',
      followUpRequired: communication.followUpRequired,
      followUpDate: communication.followUpDate ? new Date(communication.followUpDate).toISOString().split('T')[0] : '',
      tags: communication.tags,
      relatedQuoteId: communication.relatedQuoteId || '',
    });
    setShowCreateForm(true);
  };

  const handleViewCommunication = (communication: ClientCommunication) => {
    setViewingCommunication(communication);
  };

  const resetForm = () => {
    setFormData({
      type: 'email',
      subject: '',
      content: '',
      direction: 'outbound',
      priority: 'medium',
      scheduledDate: '',
      followUpRequired: false,
      followUpDate: '',
      tags: [],
      relatedQuoteId: '',
    });
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingCommunication(null);
    resetForm();
  };

  const getFilteredCommunications = () => {
    let filtered = [...communications];

    if (filterType !== 'all') {
      filtered = filtered.filter(comm => comm.type === filterType);
    }

    if (filterDirection !== 'all') {
      filtered = filtered.filter(comm => comm.direction === filterDirection);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(comm => comm.priority === filterPriority);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(comm =>
        comm.subject.toLowerCase().includes(term) ||
        comm.content.toLowerCase().includes(term) ||
        comm.createdBy.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="h-5 w-5" />;
      case 'phone': return <PhoneIcon className="h-5 w-5" />;
      case 'meeting': return <CalendarIcon className="h-5 w-5" />;
      case 'message': return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'note': return <ClockIcon className="h-5 w-5" />;
      default: return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'blue';
      case 'phone': return 'green';
      case 'meeting': return 'purple';
      case 'message': return 'yellow';
      case 'note': return 'gray';
      default: return 'gray';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'inbound' ? 'blue' : 'green';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'green';
      case 'delivered': return 'blue';
      case 'read': return 'purple';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCommunications = getFilteredCommunications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Client Communications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all communications with {client.companyName}
          </p>
        </div>

        <Button onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Communication
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="meeting">Meeting</option>
                <option value="message">Message</option>
                <option value="note">Note</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direction
              </label>
              <Select
                value={filterDirection}
                onChange={(e) => setFilterDirection(e.target.value)}
              >
                <option value="all">All Directions</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCommunication ? 'Edit Communication' : 'New Communication'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="meeting">Meeting</option>
                  <option value="message">Message</option>
                  <option value="note">Note</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Direction
                </label>
                <Select
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as any }))}
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <Input
                type="text"
                placeholder="Communication subject..."
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <Textarea
                placeholder="Communication content..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Follow-up Required
                </label>
              </div>

              {formData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
              
              <Button
                onClick={editingCommunication ? handleUpdateCommunication : handleCreateCommunication}
                disabled={!formData.subject || !formData.content}
              >
                {editingCommunication ? 'Update' : 'Create'} Communication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Communications ({filteredCommunications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading communications...</p>
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No communications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunications.map((communication) => (
                <Card key={communication.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full bg-${getTypeColor(communication.type)}-100`}>
                          {getTypeIcon(communication.type)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" color={getTypeColor(communication.type)}>
                            {communication.type.charAt(0).toUpperCase() + communication.type.slice(1)}
                          </Badge>
                          
                          <Badge variant="outline" color={getDirectionColor(communication.direction)}>
                            {communication.direction.charAt(0).toUpperCase() + communication.direction.slice(1)}
                          </Badge>
                          
                          <Badge variant="outline" color={getPriorityColor(communication.priority)}>
                            {communication.priority.charAt(0).toUpperCase() + communication.priority.slice(1)}
                          </Badge>
                          
                          <Badge variant="outline" color={getStatusColor(communication.status)}>
                            {communication.status.charAt(0).toUpperCase() + communication.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatDate(communication.createdAt)}</span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCommunication(communication)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCommunication(communication)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCommunication(communication.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {communication.subject}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {communication.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>By: {communication.createdBy}</span>
                        
                        {communication.scheduledDate && (
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Scheduled: {formatDate(communication.scheduledDate)}</span>
                          </span>
                        )}
                        
                        {communication.followUpRequired && (
                          <span className="flex items-center space-x-1 text-orange-600">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Follow-up required</span>
                          </span>
                        )}
                      </div>
                      
                      {communication.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {communication.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {communication.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{communication.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Communication Modal */}
      {viewingCommunication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Communication Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingCommunication(null)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full bg-${getTypeColor(viewingCommunication.type)}-100`}>
                    {getTypeIcon(viewingCommunication.type)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" color={getTypeColor(viewingCommunication.type)}>
                      {viewingCommunication.type.charAt(0).toUpperCase() + viewingCommunication.type.slice(1)}
                    </Badge>
                    
                    <Badge variant="outline" color={getDirectionColor(viewingCommunication.direction)}>
                      {viewingCommunication.direction.charAt(0).toUpperCase() + viewingCommunication.direction.slice(1)}
                    </Badge>
                    
                    <Badge variant="outline" color={getPriorityColor(viewingCommunication.priority)}>
                      {viewingCommunication.priority.charAt(0).toUpperCase() + viewingCommunication.priority.slice(1)}
                    </Badge>
                    
                    <Badge variant="outline" color={getStatusColor(viewingCommunication.status)}>
                      {viewingCommunication.status.charAt(0).toUpperCase() + viewingCommunication.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {viewingCommunication.subject}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {viewingCommunication.content}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Created By
                    </label>
                    <p className="text-gray-900 dark:text-white">{viewingCommunication.createdBy}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Created At
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(viewingCommunication.createdAt)}</p>
                  </div>
                  
                  {viewingCommunication.scheduledDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Scheduled Date
                      </label>
                      <p className="text-gray-900 dark:text-white">{formatDate(viewingCommunication.scheduledDate)}</p>
                    </div>
                  )}
                  
                  {viewingCommunication.followUpRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Follow-up Required
                      </label>
                      <p className="text-orange-600 font-medium">Yes</p>
                    </div>
                  )}
                  
                  {viewingCommunication.followUpDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Follow-up Date
                      </label>
                      <p className="text-gray-900 dark:text-white">{formatDate(viewingCommunication.followUpDate)}</p>
                    </div>
                  )}
                </div>
                
                {viewingCommunication.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {viewingCommunication.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingCommunication(null);
                      handleEditCommunication(viewingCommunication);
                    }}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => setViewingCommunication(null)}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
