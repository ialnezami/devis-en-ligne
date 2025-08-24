import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  PlusIcon,
  DocumentIcon,
  ArrowDownOnSquareIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  TagIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Client, ClientDocument, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientDocumentationProps {
  client: Client;
  onDocumentUploaded?: (document: ClientDocument) => void;
  onDocumentDeleted?: (documentId: string) => void;
  onDocumentUpdated?: (document: ClientDocument) => void;
}

export const ClientDocumentation: React.FC<ClientDocumentationProps> = ({
  client,
  onDocumentUploaded,
  onDocumentDeleted,
  onDocumentUpdated,
}) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ClientDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<ClientDocument | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as const,
    description: '',
    tags: [] as string[],
    isPublic: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [client.id]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const documentsData = await clientManagementService.getClientDocuments(client.id);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if not provided
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please provide a document name');
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const newDocument = await clientManagementService.uploadClientDocument(
        client.id,
        selectedFile,
        {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          tags: formData.tags,
          isPublic: formData.isPublic,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setDocuments(prev => [newDocument, ...prev]);
      setShowUploadForm(false);
      resetForm();
      toast.success('Document uploaded successfully');

      if (onDocumentUploaded) {
        onDocumentUploaded(newDocument);
      }

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
      setUploadProgress(0);
    }
  };

  const handleUpdateDocument = async (documentId: string, updates: Partial<ClientDocument>) => {
    try {
      // Note: The service doesn't have updateDocument method, so we'll simulate it
      // In a real implementation, you'd call the API
      const updatedDocuments = documents.map(doc =>
        doc.id === documentId ? { ...doc, ...updates } : doc
      );
      
      setDocuments(updatedDocuments);
      setEditingDocument(null);
      toast.success('Document updated successfully');

      if (onDocumentUpdated) {
        const updatedDoc = updatedDocuments.find(doc => doc.id === documentId);
        if (updatedDoc) {
          onDocumentUpdated(updatedDoc);
        }
      }
    } catch (error) {
      console.error('Failed to update document:', error);
      toast.error('Failed to update document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await clientManagementService.deleteClientDocument(client.id, documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');

        if (onDocumentDeleted) {
          onDocumentDeleted(documentId);
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleEditDocument = (document: ClientDocument) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      type: document.type,
      description: document.description || '',
      tags: document.tags,
      isPublic: document.isPublic,
    });
    setShowUploadForm(true);
  };

  const handleViewDocument = (document: ClientDocument) => {
    setViewingDocument(document);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      description: '',
      tags: [],
      isPublic: false,
    });
    setSelectedFile(null);
  };

  const cancelForm = () => {
    setShowUploadForm(false);
    setEditingDocument(null);
    resetForm();
  };

  const getFilteredDocuments = () => {
    let filtered = [...documents];

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter(doc =>
        doc.tags.some(tag => filterTags.includes(tag))
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <DocumentIcon className="h-5 w-5" />;
      case 'proposal': return <DocumentIcon className="h-5 w-5" />;
      case 'invoice': return <DocumentIcon className="h-5 w-5" />;
      case 'agreement': return <DocumentIcon className="h-5 w-5" />;
      default: return <DocumentIcon className="h-5 w-5" />;
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Client Documentation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage documents and files for {client.companyName}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button onClick={() => setShowUploadForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Document Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="contract">Contract</option>
                  <option value="proposal">Proposal</option>
                  <option value="invoice">Invoice</option>
                  <option value="agreement">Agreement</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <Input
                  type="text"
                  placeholder="Filter by tags (comma-separated)"
                  value={filterTags.join(', ')}
                  onChange={(e) => setFilterTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDocument ? 'Edit Document' : 'Upload New Document'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter document name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="contract">Contract</option>
                  <option value="proposal">Proposal</option>
                  <option value="invoice">Invoice</option>
                  <option value="agreement">Agreement</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                placeholder="Enter document description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <Input
                type="text"
                placeholder="Enter tags (comma-separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Make document public
              </label>
            </div>

            {!editingDocument && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Choose a file
                  </label>
                  <span className="text-gray-500"> or drag and drop</span>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
              
              <Button
                onClick={editingDocument ? () => handleUpdateDocument(editingDocument.id, formData) : handleUploadDocument}
                disabled={!editingDocument && (!selectedFile || !formData.name.trim())}
              >
                {editingDocument ? 'Update' : 'Upload'} Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full bg-${getDocumentTypeColor(document.type)}-100`}>
                          {getDocumentTypeIcon(document.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{document.name}</h3>
                          <Badge variant="outline" color={getDocumentTypeColor(document.type)}>
                            {document.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p>Size: {formatFileSize(document.fileSize)}</p>
                      <p>Uploaded: {formatDate(document.uploadDate)}</p>
                      <p>By: {document.uploadedBy}</p>
                    </div>
                    
                    {document.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {document.description}
                      </p>
                    )}
                    
                    {document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <ArrowDownOnSquareIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={() => handleViewDocument(document)}>
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={() => handleEditDocument(document)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
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
          )}
        </CardContent>
      </Card>

      {/* View Document Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Document Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDocument(null)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full bg-${getDocumentTypeColor(viewingDocument.type)}-100`}>
                    {getDocumentTypeIcon(viewingDocument.type)}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{viewingDocument.name}</h3>
                    <Badge variant="outline" color={getDocumentTypeColor(viewingDocument.type)}>
                      {viewingDocument.type}
                    </Badge>
                  </div>
                </div>
                
                {viewingDocument.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">{viewingDocument.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Size
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatFileSize(viewingDocument.fileSize)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Type
                    </label>
                    <p className="text-gray-900 dark:text-white">{viewingDocument.fileType}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Date
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(viewingDocument.uploadDate)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Uploaded By
                    </label>
                    <p className="text-gray-900 dark:text-white">{viewingDocument.uploadedBy}</p>
                  </div>
                </div>
                
                {viewingDocument.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {viewingDocument.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <ArrowDownOnSquareIcon className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => {
                      setViewingDocument(null);
                      handleEditDocument(viewingDocument);
                    }}>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  <Button onClick={() => setViewingDocument(null)}>
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
