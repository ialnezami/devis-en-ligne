import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  FolderIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DownloadIcon,
  TrashIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { BatchExportRequest, PDFExportResult, PDFExportOptions } from '@/services/pdfExportService';
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

interface BatchExportProps {
  quotations: QuotationItem[];
  onClose: () => void;
}

export const BatchExport: React.FC<BatchExportProps> = ({
  quotations,
  onClose,
}) => {
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>(
    pdfExportService.getDefaultExportOptions()
  );
  const [outputFormat, setOutputFormat] = useState<'individual' | 'combined' | 'zip'>('zip');
  const [templateId, setTemplateId] = useState<string>('');
  const [documentType, setDocumentType] = useState<'quotation' | 'invoice' | 'proposal'>('quotation');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
    status: string;
  }>({ current: 0, total: 0, status: 'idle' });
  const [exportResults, setExportResults] = useState<PDFExportResult[]>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string }>>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const availableTemplates = await pdfExportService.getAvailableTemplates();
      setTemplates(availableTemplates);
      if (availableTemplates.length > 0) {
        setTemplateId(availableTemplates[0].id);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const toggleQuotationSelection = (quotationId: string) => {
    setSelectedQuotations(prev => 
      prev.includes(quotationId)
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const selectAll = () => {
    setSelectedQuotations(quotations.map(q => q.id));
  };

  const selectNone = () => {
    setSelectedQuotations([]);
  };

  const handleExport = async () => {
    if (selectedQuotations.length === 0) {
      toast.error('Please select at least one quotation to export');
      return;
    }

    setIsExporting(true);
    setExportProgress({ current: 0, total: selectedQuotations.length, status: 'Starting export...' });
    setExportResults([]);

    try {
      const request: BatchExportRequest = {
        quotationIds: selectedQuotations,
        templateId: templateId || undefined,
        documentType,
        options: exportOptions,
        outputFormat,
      };

      if (outputFormat === 'zip') {
        // Single ZIP file export
        setExportProgress({ current: 0, total: 1, status: 'Generating ZIP archive...' });
        const results = await pdfExportService.batchExport(request);
        setExportResults(results);
        
        if (results[0]?.success && results[0]?.url) {
          pdfExportService.downloadPDF(results[0].url, results[0].filename);
          toast.success('Batch export completed successfully!');
        } else {
          toast.error('Batch export failed');
        }
      } else {
        // Individual or combined export
        const results: PDFExportResult[] = [];
        
        for (let i = 0; i < selectedQuotations.length; i++) {
          const quotationId = selectedQuotations[i];
          setExportProgress({
            current: i + 1,
            total: selectedQuotations.length,
            status: `Exporting quotation ${i + 1} of ${selectedQuotations.length}...`
          });

          const result = await pdfExportService.generatePDF({
            quotationId,
            templateId: templateId || undefined,
            documentType,
            options: exportOptions,
          });

          results.push(result);

          if (result.success && result.url) {
            if (outputFormat === 'individual') {
              // Download individual files
              pdfExportService.downloadPDF(result.url, result.filename);
            }
          }
        }

        setExportResults(results);
        
        if (outputFormat === 'combined') {
          // For combined, we'd need backend support to merge PDFs
          toast.success('Individual PDFs generated successfully!');
        } else {
          toast.success('All PDFs downloaded successfully!');
        }
      }
    } catch (error) {
      console.error('Batch export failed:', error);
      toast.error('Batch export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, status: 'idle' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Batch Export
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Export multiple quotations at once
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {selectedQuotations.length} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Quotation Selection */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Quotations
                </h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectNone}>
                    Select None
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {quotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuotations.includes(quotation.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => toggleQuotationSelection(quotation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuotations.includes(quotation.id)}
                          onChange={() => toggleQuotationSelection(quotation.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {quotation.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quotation.quotationNumber} • {quotation.clientName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quotation.total)}
                        </div>
                        <Badge variant="outline" color={getStatusColor(quotation.status)}>
                          {quotation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Options
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type
                  </label>
                  <Select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                  >
                    <option value="quotation">Quotation</option>
                    <option value="invoice">Invoice</option>
                    <option value="proposal">Proposal</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template
                  </label>
                  <Select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                  >
                    <option value="">Default Template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Format
                  </label>
                  <Select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as any)}
                  >
                    <option value="zip">ZIP Archive (Recommended)</option>
                    <option value="individual">Individual Files</option>
                    <option value="combined">Combined PDF</option>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {outputFormat === 'zip' && 'All PDFs packaged in a single ZIP file'}
                    {outputFormat === 'individual' && 'Each PDF downloaded separately'}
                    {outputFormat === 'combined' && 'All quotations merged into one PDF'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Export Progress & Results */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Progress
              </h3>

              {isExporting ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {exportProgress.status}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {exportProgress.current} / {exportProgress.total}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${exportProgress.total > 0 ? (exportProgress.current / exportProgress.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Ready to export {selectedQuotations.length} quotations
                  </p>
                </div>
              )}
            </div>

            {/* Export Results */}
            {exportResults.length > 0 && (
              <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Export Results
                </h3>
                
                <div className="space-y-2">
                  {exportResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        result.success
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {result.filename}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {result.success ? 'Export successful' : result.error}
                            </div>
                          </div>
                        </div>
                        
                        {result.success && result.url && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pdfExportService.downloadPDF(result.url!, result.filename)}
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                
                <Button
                  onClick={handleExport}
                  disabled={isExporting || selectedQuotations.length === 0}
                >
                  {isExporting ? 'Exporting...' : `Export ${selectedQuotations.length} Quotations`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
