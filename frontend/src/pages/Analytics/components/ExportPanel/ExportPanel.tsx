import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon, 
  TableCellsIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ExportPanelProps {
  onExport: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
  dateRange: string;
  selectedMetrics: string[];
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  onExport,
  dateRange,
  selectedMetrics
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    format: string;
    date: string;
    status: 'completed' | 'failed' | 'in-progress';
    size?: string;
  }>>([
    {
      id: '1',
      format: 'PDF',
      date: '2024-01-15 14:30',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: '2',
      format: 'Excel',
      date: '2024-01-14 09:15',
      status: 'completed',
      size: '1.8 MB'
    }
  ]);

  const exportFormats = [
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional formatted report with charts',
      icon: DocumentTextIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      value: 'excel' as const,
      label: 'Excel Spreadsheet',
      description: 'Data in spreadsheet format for analysis',
      icon: TableCellsIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      value: 'csv' as const,
      label: 'CSV Data',
      description: 'Raw data for external processing',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
      
      // Add to export history
      const newExport = {
        id: Date.now().toString(),
        format: exportFormat.toUpperCase(),
        date: new Date().toLocaleString(),
        status: 'completed' as const,
        size: `${Math.random() * 3 + 1} MB`
      };
      
      setExportHistory(prev => [newExport, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Export failed:', error);
      
      // Add failed export to history
      const failedExport = {
        id: Date.now().toString(),
        format: exportFormat.toUpperCase(),
        date: new Date().toLocaleString(),
        status: 'failed' as const
      };
      
      setExportHistory(prev => [failedExport, ...prev.slice(0, 4)]);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'in-progress':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Export Analytics Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Export your analytics data in various formats for reporting and analysis
        </p>
      </div>

      {/* Export Configuration */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-1 gap-3">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              const isSelected = exportFormat === format.value;
              
              return (
                <label
                  key={format.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={isSelected}
                    onChange={() => setExportFormat(format.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <IconComponent className={`h-5 w-5 ml-3 ${format.color}`} />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {format.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Summary
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>• Date Range: {dateRange}</div>
            <div>• Metrics: {selectedMetrics.length} selected</div>
            <div>• Format: {exportFormats.find(f => f.value === exportFormat)?.label}</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || selectedMetrics.length === 0}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
          isExporting || selectedMetrics.length === 0
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export {exportFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Export History */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Exports
        </h4>
        <div className="space-y-2">
          {exportHistory.map((exportItem) => (
            <div
              key={exportItem.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(exportItem.status)}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {exportItem.format} Export
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {exportItem.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {exportItem.size && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {exportItem.size}
                  </span>
                )}
                <span className={`text-xs font-medium ${getStatusColor(exportItem.status)}`}>
                  {exportItem.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add missing XCircleIcon
const XCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ExportPanel;
