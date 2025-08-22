import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from 'react-pdf';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  PrinterIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { PDFExportResult } from '@/services/pdfExportService';

interface PDFPreviewProps {
  pdfResult: PDFExportResult | null;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfResult,
  onClose,
  onDownload,
  onPrint,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    if (pdfResult?.url) {
      loadPDF();
    }
  }, [pdfResult]);

  const loadPDF = async () => {
    if (!pdfResult?.url) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load PDF using PDF.js
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const loadingTask = pdfjsLib.getDocument(pdfResult.url);
      const pdf = await loadingTask.promise;
      
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page
      await renderPage(1);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError('Failed to load PDF preview');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return;

    try {
      const page = await pdfRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Failed to render page:', err);
      setError('Failed to render page');
    }
  };

  const changePage = async (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return;
    
    setCurrentPage(newPage);
    await renderPage(newPage);
  };

  const changeScale = async (newScale: number) => {
    const clampedScale = Math.max(0.25, Math.min(3.0, newScale));
    setScale(clampedScale);
    await renderPage(currentPage);
  };

  const nextPage = () => changePage(currentPage + 1);
  const prevPage = () => changePage(currentPage - 1);
  const zoomIn = () => changeScale(scale + 0.25);
  const zoomOut = () => changeScale(scale - 0.25);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!pdfResult) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                PDF Preview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pdfResult.filename} • {formatFileSize(pdfResult.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {pdfResult.metadata?.pageCount || 1} pages
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {numPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= numPages}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.25}
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThumbnails(!showThumbnails)}
            >
              {showThumbnails ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>

            <Button
              size="sm"
              onClick={onDownload}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails Sidebar */}
          {showThumbnails && (
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto p-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-2">
                Thumbnails
              </h3>
              <div className="space-y-2">
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`cursor-pointer p-2 rounded border-2 transition-colors ${
                      currentPage === i + 1
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => changePage(i + 1)}
                  >
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 mb-1">
                      Page {i + 1}
                    </div>
                    <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-auto p-4">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                <Button variant="outline" onClick={loadPDF}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Generated: {pdfResult.metadata?.generatedAt?.toLocaleString() || 'Unknown'}
              {pdfResult.metadata?.template && ` • Template: ${pdfResult.metadata.template}`}
            </div>
            <div>
              Scale: {Math.round(scale * 100)}% • Page {currentPage} of {numPages}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
