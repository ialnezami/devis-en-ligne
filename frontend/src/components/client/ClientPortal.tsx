import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  TagIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DuplicateIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Client, clientManagementService } from '@/services/clientManagementService';
import { ClientList } from './ClientList';
import { ClientProfile } from './ClientProfile';
import { ClientCommunication } from './ClientCommunication';
import { ClientActivityTracking } from './ClientActivityTracking';
import { ClientOnboarding } from './ClientOnboarding';
import { ClientDocumentation } from './ClientDocumentation';
import { toast } from 'react-hot-toast';

interface ClientPortalProps {
  onClientSelect?: (client: Client) => void;
  onClientEdit?: (client: Client) => void;
  onClientDelete?: (client: Client) => void;
  onClientDuplicate?: (client: Client) => void;
  onClientShare?: (client: Client) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  onClientSelect,
  onClientEdit,
  onClientDelete,
  onClientDuplicate,
  onClientShare,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const clientsData = await clientManagementService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('overview');
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleClientEdit = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
    if (onClientEdit) {
      onClientEdit(client);
    }
  };

  const handleClientDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.companyName}?`)) {
      try {
        await clientManagementService.deleteClient(client.id);
        setClients(prev => prev.filter(c => c.id !== client.id));
        if (selectedClient?.id === client.id) {
          setSelectedClient(null);
        }
        toast.success('Client deleted successfully');
        if (onClientDelete) {
          onClientDelete(client);
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleClientDuplicate = async (client: Client) => {
    try {
      const duplicatedClient = await clientManagementService.duplicateClient(client.id);
      setClients(prev => [duplicatedClient, ...prev]);
      toast.success('Client duplicated successfully');
      if (onClientDuplicate) {
        onClientDuplicate(duplicatedClient);
      }
    } catch (error) {
      console.error('Failed to duplicate client:', error);
      toast.error('Failed to duplicate client');
    }
  };

  const handleClientShare = (client: Client) => {
    // Implement sharing functionality
    if (onClientShare) {
      onClientShare(client);
    }
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      if (editingClient) {
        const updatedClient = await clientManagementService.updateClient(editingClient.id, clientData);
        setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient(updatedClient);
        }
        toast.success('Client updated successfully');
      } else {
        const newClient = await clientManagementService.createClient(clientData);
        setClients(prev => [newClient, ...prev]);
        toast.success('Client created successfully');
      }
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Failed to save client:', error);
      toast.error('Failed to save client');
    }
  };

  const getFilteredClients = () => {
    let filtered = [...clients];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(client => client.priority === filterPriority);
    }

    if (filterIndustry !== 'all') {
      filtered = filtered.filter(client => client.industry === filterIndustry);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.companyName.toLowerCase().includes(term) ||
        client.contactPerson.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'prospect': return 'blue';
      case 'lead': return 'yellow';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const filteredClients = getFilteredClients();

  if (showClientForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingClient ? 'Edit Client' : 'Create New Client'}
          </h2>
          <Button variant="outline" onClick={() => setShowClientForm(false)}>
            Cancel
          </Button>
        </div>
        
        {/* Client Form would go here */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Client form implementation would go here. This is a placeholder for the form component.
            </p>
            <div className="mt-4 flex space-x-2">
              <Button onClick={() => handleSaveClient({})}>
                {editingClient ? 'Update' : 'Create'} Client
              </Button>
              <Button variant="outline" onClick={() => setShowClientForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Client Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your client relationships, communications, and documentation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setActiveTab('clients')}>
            <UserIcon className="h-4 w-4 mr-2" />
            All Clients
          </Button>
          
          <Button onClick={handleCreateClient}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clients.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <StarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <BuildingOfficeIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prospects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clients.filter(c => c.status === 'prospect').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(clients.reduce((sum, c) => sum + (c.annualRevenue || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Client List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                />
                
                <div className="space-y-2">
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                    <option value="lead">Lead</option>
                  </Select>
                  
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {client.companyName}
                      </h4>
                      <Badge variant="outline" color={getStatusColor(client.status)} className="text-xs">
                        {client.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className="truncate">{client.contactPerson}</span>
                      {client.priority !== 'medium' && (
                        <Badge variant="outline" color={getPriorityColor(client.priority)} className="text-xs">
                          {client.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-3">
          {selectedClient ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <ClientProfile
                  clientId={selectedClient.id}
                  onClientEdit={handleClientEdit}
                  onClientDelete={handleClientDelete}
                  onClientDuplicate={handleClientDuplicate}
                  onClientShare={handleClientShare}
                />
              </TabsContent>

              <TabsContent value="communication" className="space-y-6">
                <ClientCommunication
                  client={selectedClient}
                  onCommunicationCreated={() => {}}
                  onCommunicationUpdated={() => {}}
                  onCommunicationDeleted={() => {}}
                />
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                <ClientActivityTracking
                  client={selectedClient}
                  onActivityLogged={() => {}}
                />
              </TabsContent>

              <TabsContent value="onboarding" className="space-y-6">
                <ClientOnboarding
                  client={selectedClient}
                  onOnboardingCreated={() => {}}
                  onOnboardingUpdated={() => {}}
                  onOnboardingCompleted={() => {}}
                />
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <ClientDocumentation
                  client={selectedClient}
                  onDocumentUploaded={() => {}}
                  onDocumentDeleted={() => {}}
                  onDocumentUpdated={() => {}}
                />
              </TabsContent>

              <TabsContent value="quotes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Quote management integration would go here. This would show all quotes related to this client.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Client Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a client from the list to view their details and manage their information.
                </p>
                <Button onClick={handleCreateClient}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
