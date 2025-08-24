import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  FolderIcon,
  ClockIcon,
  ArrowDownOnSquareIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { PDFExportConfig } from './PDFExportConfig';
import { PDFPreview } from './PDFPreview';
import { BatchExport } from './BatchExport';
import { ExportHistory } from './ExportHistory';
import { PDFExportOptions, PDFExportResult, QuotationPDFData } from '@/services/pdfExportService';
import { pdfExportService } from '@/services/pdfExportService';
import { toast } from 'react-hot-toast';

interface QuotationItem {
  id: string;
  title: string;
  quotationNumber: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface PDFExportDashboardProps {
  quotationId?: string;
  quotations?: QuotationItem[];
  onClose?: () => void;
}

export const PDFExportDashboard: React.FC<PDFExportDashboardProps> = ({
  quotationId,
  quotations = [],
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>(
    pdfExportService.getDefaultExportOptions()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFExportResult | null>(null);
  const [showBatchExport, setShowBatchExport] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [recentExports, setRecentExports] = useState<any[]>([]);

  useEffect(() => {
    if (quotationId) {
      loadExportHistory();
    }
  }, [quotationId]);

  const loadExportHistory = async () => {
    try {
      const history = await pdfExportService.getExportHistory(quotationId);
      setExportHistory(history);
      setRecentExports(history.slice(0, 5)); // Show last 5 exports
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  };

  const handleExport = async () => {
    if (!quotationId) {
      toast.error('No quotation selected for export');
      return;
    }

    setIsExporting(true);
    try {
      const exportData: QuotationPDFData = {
        quotationId,
        documentType: 'quotation',
        options: exportOptions,
      };

      const result = await pdfExportService.generatePDF(exportData);
      setPdfResult(result);

      if (result.success) {
        toast.success('PDF generated successfully!');
        // Automatically download the PDF
        if (result.url) {
          pdfExportService.downloadPDF(result.url, result.filename);
        }
        // Refresh export history
        await loadExportHistory();
      } else {
        toast.error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    if (!quotationId) {
      toast.error('No quotation selected for preview');
      return;
    }

    setIsPreviewing(true);
    try {
      const exportData: QuotationPDFData = {
        quotationId,
        documentType: 'quotation',
        options: exportOptions,
      };

      const result = await pdfExportService.previewPDF(exportData);
      setPdfResult({
        success: true,
        filename: `preview_${quotationId}.pdf`,
        size: 0,
        url: result,
      });
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Preview failed. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleClosePreview = () => {
    setPdfResult(null);
    if (pdfResult?.url) {
      window.URL.revokeObjectURL(pdfResult.url);
    }
  };

  const handleDownload = () => {
    if (pdfResult?.url) {
      pdfExportService.downloadPDF(pdfResult.url, pdfResult.filename);
    }
  };

  const handlePrint = async () => {
    if (pdfResult?.url) {
      try {
        await pdfExportService.printPDF(pdfResult.url);
      } catch (error) {
        toast.error('Print failed. Please try again.');
      }
    }
  };

  const handleBatchExport = () => {
    if (quotations.length === 0) {
      toast.error('No quotations available for batch export');
      return;
    }
    setShowBatchExport(true);
  };

  const handleBatchExportClose = () => {
    setShowBatchExport(false);
    // Refresh export history after batch export
    loadExportHistory();
  };

  const getExportStats = () => {
    const total = exportHistory.length;
    const completed = exportHistory.filter(item => item.status === 'completed').length;
    const failed = exportHistory.filter(item => item.status === 'failed').length;
    const processing = exportHistory.filter(item => item.status === 'processing').length;

    return { total, completed, failed, processing };
  };

  const stats = getExportStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            PDF Export Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate, customize, and manage PDF exports for your quotations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {quotationId && (
            <Badge variant="outline" className="text-sm">
              Single Quotation Export
            </Badge>
          )}
          
          {quotations.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBatchExport}
              className="flex items-center space-x-2"
            >
              <FolderIcon className="h-4 w-4" />
              <span>Batch Export ({quotations.length})</span>
            </Button>
          )}

          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ArrowDownOnSquareIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Export Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <EyeIcon className="h-4 w-4" />
            <span>Preview & Export</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>Export History</span>
          </TabsTrigger>
        </TabsList>

        {/* Export Configuration Tab */}
        <TabsContent value="export" className="space-y-4">
          <PDFExportConfig
            options={exportOptions}
            onOptionsChange={setExportOptions}
            onExport={handleExport}
            onPreview={handlePreview}
            isExporting={isExporting}
            isPreviewing={isPreviewing}
          />
        </TabsContent>

        {/* Preview & Export Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EyeIcon className="h-5 w-5" />
                <span>PDF Preview & Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pdfResult ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Generate a preview or export to see the PDF here
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={isPreviewing || !quotationId}
                    >
                      {isPreviewing ? 'Generating Preview...' : 'Generate Preview'}
                    </Button>
                    
                    <Button
                      onClick={handleExport}
                      disabled={isExporting || !quotationId}
                    >
                      {isExporting ? 'Generating PDF...' : 'Export PDF'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {pdfResult.filename}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Size: {pdfResult.size} bytes • Generated: {pdfResult.metadata?.generatedAt?.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handlePrint}>
                        Print
                      </Button>
                      <Button onClick={handleDownload}>
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* PDF Preview would be embedded here */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="text-center py-8">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        PDF Preview
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Click "Generate Preview" to see the PDF here
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="history" className="space-y-4">
          <ExportHistory quotationId={quotationId} />
        </TabsContent>
      </Tabs>

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span>Recent Exports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExports.map((exportItem, index) => (
                <div
                  key={exportItem.id || index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {exportItem.filename}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exportItem.metadata?.template || 'Default Template'} • {exportItem.metadata?.pageCount || 1} pages
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" color={exportItem.status === 'completed' ? 'green' : 'red'}>
                      {exportItem.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Handle re-download
                        toast.success('Re-downloading PDF...');
                      }}
                    >
                      <ArrowDownOnSquareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Export Modal */}
      {showBatchExport && (
        <BatchExport
          quotations={quotations}
          onClose={handleBatchExportClose}
        />
      )}

      {/* PDF Preview Modal */}
      {pdfResult && (
        <PDFPreview
          pdfResult={pdfResult}
          onClose={handleClosePreview}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};
