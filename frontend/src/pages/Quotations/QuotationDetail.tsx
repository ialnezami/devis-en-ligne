import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArrowDownOnSquareIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { Quotation } from '@/types/quotation';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

// Mock quotation data for demonstration
const mockQuotation: Quotation = {
  id: '1',
  quotationNumber: 'QT-2024-001',
  title: 'Website Development Project',
  description: 'Complete website development with CMS integration, responsive design, and SEO optimization',
  client: {
    id: '1',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    company: 'Acme Corporation',
    phone: '+1-555-0123'
  },
  status: 'sent',
  priority: 'high',
  totalAmount: 15000,
  currency: 'USD',
  validUntil: new Date('2024-03-15'),
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
  sentAt: new Date('2024-02-01'),
  expiresAt: new Date('2024-03-15'),
  items: [
    {
      id: '1',
      name: 'Website Design',
      description: 'Custom responsive design',
      quantity: 1,
      unitPrice: 5000,
      total: 5000
    },
    {
      id: '2',
      name: 'CMS Development',
      description: 'WordPress CMS with custom plugins',
      quantity: 1,
      unitPrice: 7000,
      total: 7000
    },
    {
      id: '3',
      name: 'SEO Optimization',
      description: 'Search engine optimization setup',
      quantity: 1,
      unitPrice: 3000,
      total: 3000
    }
  ],
  attachments: [
    {
      id: '1',
      name: 'Project_Specifications.pdf',
      type: 'document',
      url: '#',
      size: 2048576,
      uploadedAt: new Date('2024-02-01')
    }
  ],
  tags: ['website', 'development', 'cms', 'seo'],
  customFields: {}
};

const QuotationDetail: React.FC = () => {
  const [quotation] = useState<Quotation>(mockQuotation);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [newStatus, setNewStatus] = useState(quotation.status);
  const [statusComment, setStatusComment] = useState('');

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'viewed', label: 'Viewed', color: 'yellow' },
    { value: 'accepted', label: 'Accepted', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'expired', label: 'Expired', color: 'gray' }
  ];

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'gray';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'viewed':
        return <EyeIcon className="h-5 w-5" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const handleStatusChange = () => {
    // In a real app, this would update the quotation status via API
    console.log('Status changed to:', newStatus, 'Comment:', statusComment);
    setShowStatusModal(false);
    setStatusComment('');
  };

  const handleShare = (method: string) => {
    console.log('Sharing via:', method);
    setShowShareModal(false);
  };

  const handleClone = () => {
    console.log('Cloning quotation:', quotation.id);
    setShowCloneModal(false);
  };

  const renderStatusBadge = () => (
    <Badge variant={getStatusColor(newStatus) as any} size="lg" className="flex items-center space-x-2">
      {getStatusIcon(newStatus)}
      <span>{statusOptions.find(s => s.value === newStatus)?.label}</span>
    </Badge>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {quotation.title}
            </h1>
            {renderStatusBadge()}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {quotation.description}
          </p>
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span>Quotation #{quotation.quotationNumber}</span>
            <span>•</span>
            <span>Created {formatRelativeTime(quotation.createdAt)}</span>
            <span>•</span>
            <span>Valid until {formatDate(quotation.validUntil)}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowStatusModal(true)}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Change Status
          </Button>
          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={() => setShowPDFModal(true)}>
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button variant="outline" onClick={() => setShowCloneModal(true)}>
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Button>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Client Name
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {quotation.client.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Company
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {quotation.client.company}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {quotation.client.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {quotation.client.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items and Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Items & Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} × {formatCurrency(item.unitPrice, quotation.currency)}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total, quotation.currency)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(quotation.totalAmount, quotation.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline and Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Timeline & Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date</span>
                  <span className="font-medium">{formatDate(quotation.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sent Date</span>
                  <span className="font-medium">{quotation.sentAt ? formatDate(quotation.sentAt) : 'Not sent'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Valid Until</span>
                  <span className="font-medium">{formatDate(quotation.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Expires</span>
                  <span className="font-medium">{formatDate(quotation.expiresAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {quotation.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Attachments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotation.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {attachment.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowDownOnSquareIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions and Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Quotation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ArrowDownOnSquareIcon className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </CardContent>
          </Card>

          {/* Quotation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                <Badge variant={quotation.priority === 'high' ? 'destructive' : 'default'}>
                  {quotation.priority}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
                <span className="font-medium">{quotation.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                <span className="font-medium">{formatCurrency(quotation.totalAmount, quotation.currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quotation.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Quotation sent
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(quotation.sentAt || quotation.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Quotation created
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(quotation.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Quotation Status"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Add a comment about this status change..."
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange}>
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Quotation"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleShare('email')}
            >
              <PaperAirplaneIcon className="h-6 w-6" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleShare('link')}
            >
              <ShareIcon className="h-6 w-6" />
              <span>Share Link</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleShare('whatsapp')}
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span>WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleShare('download')}
            >
              <ArrowDownOnSquareIcon className="h-6 w-6" />
              <span>Download</span>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowShareModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        title="PDF Preview"
        size="6xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
            <DocumentTextIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              PDF preview would be displayed here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This would show the actual quotation PDF in an embedded viewer
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPDFModal(false)}>
                Close
              </Button>
              <Button>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Clone Modal */}
      <Modal
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        title="Clone Quotation"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This will create a copy of the current quotation with a new number. You can then modify it as needed.
          </p>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCloneModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleClone}>
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Clone Quotation
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Revision History Modal */}
      <Modal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        title="Revision History"
        size="4xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              This would show a detailed history of all changes made to the quotation, including who made changes and when.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowRevisionModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Comparison Modal */}
      <Modal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        title="Compare Quotations"
        size="6xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              This would show a side-by-side comparison of different versions or quotations.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowComparisonModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuotationDetail;
