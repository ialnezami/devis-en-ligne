import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  PlusIcon,
  DownloadIcon,
  TrashIcon,
  EyeIcon,
  ShareIcon,
  DuplicateIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Client, ClientDocument, ClientCommunication, ClientActivity, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientProfileProps {
  clientId: string;
  onClientEdit?: (client: Client) => void;
  onClientDelete?: (client: Client) => void;
  onClientDuplicate?: (client: Client) => void;
  onClientShare?: (client: Client) => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  clientId,
  onClientEdit,
  onClientDelete,
  onClientDuplicate,
  onClientShare,
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setIsLoading(true);
    try {
      const [clientData, documentsData, communicationsData, activitiesData] = await Promise.all([
        clientManagementService.getClient(clientId),
        clientManagementService.getClientDocuments(clientId),
        clientManagementService.getClientCommunications(clientId),
        clientManagementService.getClientActivities(clientId),
      ]);

      setClient(clientData.client);
      setDocuments(documentsData);
      setCommunications(communicationsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load client data:', error);
      toast.error('Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientEdit = () => {
    if (client && onClientEdit) {
      onClientEdit(client);
    }
  };

  const handleClientDelete = async () => {
    if (!client) return;

    if (window.confirm(`Are you sure you want to delete "${client.companyName}"?`)) {
      try {
        await clientManagementService.deleteClient(client.id);
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

  const handleClientDuplicate = async () => {
    if (!client) return;

    const newCompanyName = prompt('Enter new company name:', `${client.companyName} (Copy)`);
    if (newCompanyName && newCompanyName.trim()) {
      try {
        const duplicatedClient = await clientManagementService.duplicateClient(client.id, newCompanyName);
        toast.success('Client duplicated successfully');
        if (onClientDuplicate) {
          onClientDuplicate(duplicatedClient.client);
        }
      } catch (error) {
        console.error('Failed to duplicate client:', error);
        toast.error('Failed to duplicate client');
      }
    }
  };

  const handleClientShare = () => {
    if (client && onClientShare) {
      onClientShare(client);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!client) return;

    try {
      await clientManagementService.deleteClientDocument(client.id, documentId);
      toast.success('Document deleted successfully');
      loadClientData();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleCommunicationDelete = async (communicationId: string) => {
    if (!client) return;

    try {
      await clientManagementService.deleteClientCommunication(client.id, communicationId);
      toast.success('Communication deleted successfully');
      loadClientData();
    } catch (error) {
      console.error('Failed to delete communication:', error);
      toast.error('Failed to delete communication');
    }
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
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case 'enterprise': return 'purple';
      case 'large': return 'blue';
      case 'medium': return 'green';
      case 'small': return 'gray';
      default: return 'gray';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'green';
      case 'proposal': return 'blue';
      case 'invoice': return 'orange';
      case 'agreement': return 'purple';
      default: return 'gray';
    }
  };

  const getCommunicationTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'blue';
      case 'phone': return 'green';
      case 'meeting': return 'purple';
      case 'message': return 'yellow';
      case 'note': return 'gray';
      default: return 'gray';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'blue';
      case 'quote_view': return 'green';
      case 'document_download': return 'orange';
      case 'communication': return 'purple';
      case 'payment': return 'green';
      case 'profile_update': return 'gray';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading client profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {client.avatar ? (
              <img
                src={client.avatar}
                alt={client.companyName}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.companyName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" color={getStatusColor(client.status)}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
              <Badge variant="outline" color={getPriorityColor(client.priority)}>
                {client.priority.charAt(0).toUpperCase() + client.priority.slice(1)}
              </Badge>
              <Badge variant="outline" color={getCompanySizeColor(client.companySize)}>
                {client.companySize.charAt(0).toUpperCase() + client.companySize.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleClientShare}>
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" onClick={handleClientDuplicate}>
            <DuplicateIcon className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          
          <Button variant="outline" onClick={handleClientEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button variant="outline" onClick={handleClientDelete} className="text-red-600">
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</label>
                  <p className="text-gray-900 dark:text-white">{client.industry}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</label>
                  <p className="text-gray-900 dark:text-white">{client.companySize}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                  {client.website ? (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>{client.website}</span>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-gray-400">Not provided</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</label>
                  {client.linkedin ? (
                    <a
                      href={client.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-gray-400">Not provided</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</label>
                  <p className="text-gray-900 dark:text-white">{client.taxId || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</label>
                  <p className="text-gray-900 dark:text-white">{client.contactPerson}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{client.email}</span>
                  </a>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span>Financial Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(client.totalRevenue)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Limit</label>
                  <p className="text-gray-900 dark:text-white">{formatCurrency(client.creditLimit)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Terms</label>
                  <p className="text-gray-900 dark:text-white">{client.paymentTerms}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5" />
                <span>Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">
                {client.address.street}<br />
                {client.address.city}, {client.address.state} {client.address.zipCode}<br />
                {client.address.country}
              </p>
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TagIcon className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-white">
                  {client.notes || 'No notes available'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Client Created</p>
                    <p className="text-xs text-gray-500">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(client.updatedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Contact</p>
                    <p className="text-xs text-gray-500">{formatDate(client.lastContactDate)}</p>
                  </div>
                </div>
                
                {client.nextFollowUpDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Next Follow-up</p>
                      <p className="text-xs text-gray-500">{formatDate(client.nextFollowUpDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Documents</h2>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <DocumentIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{document.name}</h3>
                        <Badge variant="outline" color={getDocumentTypeColor(document.type)}>
                          {document.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Size: {formatFileSize(document.fileSize)}</p>
                    <p>Uploaded: {formatDate(document.uploadDate)}</p>
                    <p>By: {document.uploadedBy}</p>
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDocumentDelete(document.id)}
                      className="text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Communications</h2>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Communication
            </Button>
          </div>

          <div className="space-y-4">
            {communications.map((communication) => (
              <Card key={communication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" color={getCommunicationTypeColor(communication.type)}>
                        {communication.type.charAt(0).toUpperCase() + communication.type.slice(1)}
                      </Badge>
                      <Badge variant="outline" color={communication.direction === 'inbound' ? 'blue' : 'green'}>
                        {communication.direction.charAt(0).toUpperCase() + communication.direction.slice(1)}
                      </Badge>
                      <Badge variant="outline" color={getPriorityColor(communication.priority)}>
                        {communication.priority.charAt(0).toUpperCase() + communication.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    <span className="text-sm text-gray-500">{formatDate(communication.createdAt)}</span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{communication.subject}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{communication.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By: {communication.createdBy}</span>
                      {communication.scheduledDate && (
                        <span>Scheduled: {formatDate(communication.scheduledDate)}</span>
                      )}
                      {communication.followUpRequired && (
                        <span className="text-orange-600">Follow-up required</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCommunicationDelete(communication.id)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Activities</h2>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" color={getActivityTypeColor(activity.type)}>
                        {activity.type.replace('_', ' ').charAt(0).toUpperCase() + activity.type.replace('_', ' ').slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{activity.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{activity.description}</p>
                  
                  {activity.ipAddress && (
                    <div className="mt-2 text-xs text-gray-500">
                      IP: {activity.ipAddress}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Quotes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{quote.title}</h3>
                      <p className="text-sm text-gray-500">#{quote.quoteNumber}</p>
                    </div>
                    
                    <Badge variant="outline" color={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Amount: {formatCurrency(quote.totalAmount)} {quote.currency}</p>
                    <p>Created: {formatDate(quote.createdAt)}</p>
                    <p>Valid until: {formatDate(quote.validUntil)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
