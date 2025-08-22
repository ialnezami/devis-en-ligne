import React, { useState } from 'react';
import { PDFExportDashboard } from './PDFExportDashboard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';

// Sample quotation data for demonstration
const sampleQuotations = [
  {
    id: '1',
    title: 'Website Development Project',
    quotationNumber: 'Q-2024-001',
    clientName: 'TechCorp Solutions',
    total: 15000,
    status: 'approved',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Mobile App Development',
    quotationNumber: 'Q-2024-002',
    clientName: 'InnovateMobile Inc',
    total: 25000,
    status: 'pending',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'E-commerce Platform',
    quotationNumber: 'Q-2024-003',
    clientName: 'ShopDirect Ltd',
    total: 35000,
    status: 'draft',
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '4',
    title: 'Cloud Migration Services',
    quotationNumber: 'Q-2024-004',
    clientName: 'CloudTech Partners',
    total: 45000,
    status: 'approved',
    createdAt: new Date('2024-01-30'),
  },
  {
    id: '5',
    title: 'Data Analytics Dashboard',
    quotationNumber: 'Q-2024-005',
    clientName: 'DataInsight Corp',
    total: 20000,
    status: 'pending',
    createdAt: new Date('2024-02-01'),
  },
];

const PDFExportDemo: React.FC = () => {
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<'single' | 'batch'>('single');

  const handleSingleExport = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setDashboardMode('single');
    setShowDashboard(true);
  };

  const handleBatchExport = () => {
    setSelectedQuotationId(null);
    setDashboardMode('batch');
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
    setSelectedQuotationId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'draft':
        return 'gray';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <PDFExportDashboard
          quotationId={dashboardMode === 'single' ? selectedQuotationId || undefined : undefined}
          quotations={dashboardMode === 'batch' ? sampleQuotations : []}
          onClose={handleCloseDashboard}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced PDF Export System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience professional-grade PDF export functionality with advanced customization, 
            digital signatures, batch processing, and comprehensive export management.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Professional Formatting
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A4, A3, Letter, Legal formats with custom margins, orientation, and styling
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <EyeIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Preview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time PDF preview with zoom, page navigation, and thumbnail views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <DownloadIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Batch Export
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Export multiple quotations simultaneously with progress tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sample Quotations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Sample Quotations for Testing</span>
              </div>
              
              <Button
                onClick={handleBatchExport}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Batch Export All</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {quotation.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {quotation.quotationNumber}
                      </p>
                    </div>
                    <Badge variant="outline" color={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <UserIcon className="h-4 w-4" />
                      <span>{quotation.clientName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(quotation.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(quotation.total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSingleExport(quotation.id)}
                    variant="outline"
                    className="w-full"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Features */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Configuration</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Page format and orientation options</li>
                  <li>• Custom margin settings</li>
                  <li>• Background and header/footer controls</li>
                  <li>• Company branding integration</li>
                  <li>• Typography customization</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security & Signatures</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Password protection</li>
                  <li>• AES-128/256 encryption</li>
                  <li>• Permission controls</li>
                  <li>• Digital signature support</li>
                  <li>• Watermark capabilities</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Batch Operations</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Multi-quotation selection</li>
                  <li>• ZIP archive creation</li>
                  <li>• Progress monitoring</li>
                  <li>• Template consistency</li>
                  <li>• Error handling</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Management</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Export history tracking</li>
                  <li>• Status monitoring</li>
                  <li>• Filtering and search</li>
                  <li>• Bulk operations</li>
                  <li>• Re-download capability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🚀 Quick Start
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Click on any quotation card above to start a single export, or use the "Batch Export All" 
                  button to export multiple quotations at once. The system will guide you through the 
                  configuration process.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                  <li>• Use the preview feature before final export to ensure quality</li>
                  <li>• Save your preferred export settings for consistent results</li>
                  <li>• Batch export is ideal for multiple quotations with similar requirements</li>
                  <li>• Check export history for previous exports and re-download options</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  🔧 Advanced Features
                </h4>
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  Explore digital signatures, custom branding, security options, and template customization 
                  in the export configuration. The system supports enterprise-grade PDF generation with 
                  professional formatting and security features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFExportDemo;
