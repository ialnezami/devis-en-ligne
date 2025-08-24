import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ArrowDownOnSquareIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PaletteIcon
} from '@heroicons/react/24/outline';
import { QuoteTemplate, TemplateVariable, templateManagementService } from '@/services/templateManagementService';
import { toast } from 'react-hot-toast';

interface TemplatePreviewProps {
  template: QuoteTemplate;
  onClose?: () => void;
  onUseTemplate?: (template: QuoteTemplate) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
  onUseTemplate
}) => {
  const [previewHtml, setPreviewHtml] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeView, setActiveView] = useState<'preview' | 'html' | 'css'>('preview');
  const [showVariables, setShowVariables] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    generatePreview();
    initializeVariableValues();
  }, [template, variableValues]);

  const initializeVariableValues = () => {
    const initialValues: Record<string, string> = {};
    template.content.variables?.forEach(variable => {
      initialValues[variable.name] = variable.defaultValue || getSampleValue(variable.type);
    });
    setVariableValues(initialValues);
  };

  const generatePreview = async () => {
    if (!template.content?.html) return;

    setIsLoading(true);
    try {
      // Generate preview with current variable values
      const result = await templateManagementService.getTemplatePreview(template.id, variableValues);
      setPreviewHtml(result.previewHtml);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      // Fallback to client-side preview generation
      generateClientSidePreview();
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientSidePreview = () => {
    let preview = template.content.html;
    
    // Replace variables with current values
    template.content.variables?.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      const value = variableValues[variable.name] || variable.defaultValue || getSampleValue(variable.type);
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    });

    // Add CSS styling
    if (template.content.css) {
      preview = `<style>${template.content.css}</style>${preview}`;
    }

    setPreviewHtml(preview);
  };

  const getSampleValue = (type: string): string => {
    switch (type) {
      case 'text': return 'Sample Text';
      case 'number': return '123';
      case 'email': return 'sample@example.com';
      case 'phone': return '+1 (555) 123-4567';
      case 'date': return '2024-01-15';
      case 'currency': return '$1,234.56';
      case 'percentage': return '15%';
      default: return 'Sample Value';
    }
  };

  const handleVariableChange = (variableName: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const resetVariables = () => {
    initializeVariableValues();
  };

  const randomizeVariables = () => {
    const randomValues: Record<string, string> = {};
    template.content.variables?.forEach(variable => {
      randomValues[variable.name] = getRandomValue(variable.type);
    });
    setVariableValues(randomValues);
  };

  const getRandomValue = (type: string): string => {
    switch (type) {
      case 'text':
        const texts = ['Lorem Ipsum', 'Sample Company', 'Test Business', 'Demo Corp', 'Example Inc'];
        return texts[Math.floor(Math.random() * texts.length)];
      case 'number':
        return Math.floor(Math.random() * 10000).toString();
      case 'email':
        const domains = ['example.com', 'test.org', 'demo.net', 'sample.co'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `user${Math.floor(Math.random() * 1000)}@${domain}`;
      case 'phone':
        return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      case 'date':
        const start = new Date(2020, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
      case 'currency':
        return `$${(Math.random() * 10000).toFixed(2)}`;
      case 'percentage':
        return `${Math.floor(Math.random() * 100)}%`;
      default:
        return 'Random Value';
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([previewHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name}_preview.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${template.name} - Print Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${previewHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getPreviewContainerStyle = () => {
    const baseStyle = {
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top left',
      transition: 'transform 0.2s ease',
    };

    switch (previewMode) {
      case 'mobile':
        return { ...baseStyle, maxWidth: '375px' };
      case 'tablet':
        return { ...baseStyle, maxWidth: '768px' };
      default:
        return { ...baseStyle, maxWidth: '100%' };
    }
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    switch (variable.type) {
      case 'select':
        return (
          <Select
            value={variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full"
          >
            <option value="">Select option</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </Select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder={variable.defaultValue || `Enter ${variable.label}`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full"
            placeholder={variable.defaultValue || `Enter ${variable.label}`}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full"
            placeholder={variable.defaultValue || `Enter ${variable.label}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Template Preview: {template.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test how your template looks with different variable values
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleDownload}>
              <ArrowDownOnSquareIcon className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            {onUseTemplate && (
              <Button onClick={() => onUseTemplate(template)}>
                Use This Template
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Variables */}
          {showVariables && (
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Template Variables</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVariables(false)}
                  >
                    <EyeSlashIcon className="h-4 w-4" />
                  </Button>
                </div>

                {template.content.variables && template.content.variables.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={resetVariables}>
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={randomizeVariables}>
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Random
                      </Button>
                    </div>

                    {template.content.variables.map((variable) => (
                      <div key={variable.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {variable.label}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {renderVariableInput(variable)}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-mono">{variable.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {variable.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No variables defined in this template
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col">
            {/* Preview Controls */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={activeView === 'preview' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView('preview')}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button
                      variant={activeView === 'html' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView('html')}
                    >
                      <CodeBracketIcon className="h-4 w-4 mr-2" />
                      HTML
                    </Button>
                    
                    <Button
                      variant={activeView === 'css' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView('css')}
                    >
                      <PaletteIcon className="h-4 w-4 mr-2" />
                      CSS
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      Mobile
                    </Button>
                    
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      Tablet
                    </Button>
                    
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      Desktop
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                      disabled={zoom <= 25}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      disabled={zoom >= 200}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {!showVariables && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariables(true)}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Show Variables
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating preview...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div style={getPreviewContainerStyle()}>
                    {activeView === 'preview' && (
                      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    )}
                    
                    {activeView === 'html' && (
                      <Card>
                        <CardContent className="p-4">
                          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
                            <code>{template.content.html}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                    
                    {activeView === 'css' && (
                      <Card>
                        <CardContent className="p-4">
                          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
                            <code>{template.content.css || 'No CSS defined'}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
