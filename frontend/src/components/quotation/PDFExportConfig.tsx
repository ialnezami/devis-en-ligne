import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  SignatureIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  PaletteIcon
} from '@heroicons/react/24/outline';
import { PDFExportOptions } from '@/services/pdfExportService';
import { pdfExportService } from '@/services/pdfExportService';

interface PDFExportConfigProps {
  options: PDFExportOptions;
  onOptionsChange: (options: PDFExportOptions) => void;
  onExport: () => void;
  onPreview: () => void;
  isExporting?: boolean;
  isPreviewing?: boolean;
}

export const PDFExportConfig: React.FC<PDFExportConfigProps> = ({
  options,
  onOptionsChange,
  onExport,
  onPreview,
  isExporting = false,
  isPreviewing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'format' | 'branding' | 'security' | 'signature'>('format');
  const [showPassword, setShowPassword] = useState(false);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string }>>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const availableTemplates = await pdfExportService.getAvailableTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const updateOption = (path: string, value: any) => {
    const newOptions = { ...options };
    const keys = path.split('.');
    let current: any = newOptions;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onOptionsChange(newOptions);
  };

  const tabs = [
    { id: 'format', label: 'Format', icon: DocumentTextIcon },
    { id: 'branding', label: 'Branding', icon: PaintBrushIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'signature', label: 'Digital Signature', icon: SignatureIcon },
  ];

  const formatOptions = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
  ];

  const orientationOptions = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
  ];

  const encryptionOptions = [
    { value: 'AES-128', label: 'AES-128 (Standard)' },
    { value: 'AES-256', label: 'AES-256 (High Security)' },
  ];

  const renderFormatTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Format
          </label>
          <Select
            value={options.format || 'A4'}
            onChange={(e) => updateOption('format', e.target.value)}
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Orientation
          </label>
          <Select
            value={options.orientation || 'portrait'}
            onChange={(e) => updateOption('orientation', e.target.value)}
          >
            {orientationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Margins
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <div key={side}>
              <label className="block text-xs text-gray-500 mb-1 capitalize">
                {side}
              </label>
              <Input
                type="text"
                value={options.margin?.[side as keyof typeof options.margin] || '20mm'}
                onChange={(e) => updateOption(`margin.${side}`, e.target.value)}
                placeholder="20mm"
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="printBackground"
            checked={options.printBackground || false}
            onChange={(e) => updateOption('printBackground', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="printBackground" className="text-sm text-gray-700 dark:text-gray-300">
            Print background colors and images
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="displayHeaderFooter"
            checked={options.displayHeaderFooter || false}
            onChange={(e) => updateOption('displayHeaderFooter', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="displayHeaderFooter" className="text-sm text-gray-700 dark:text-gray-300">
            Display header and footer
          </label>
        </div>
      </div>
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Logo URL
        </label>
        <Input
          type="url"
          value={options.branding?.logo || ''}
          onChange={(e) => updateOption('branding.logo', e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the URL of your company logo to include in the PDF header
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['primary', 'secondary', 'accent'].map((color) => (
            <div key={color}>
              <label className="block text-xs text-gray-500 mb-1 capitalize">
                {color} Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={options.branding?.colors?.[color as keyof typeof options.branding.colors] || '#000000'}
                  onChange={(e) => updateOption(`branding.colors.${color}`, e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300"
                />
                <Input
                  type="text"
                  value={options.branding?.colors?.[color as keyof typeof options.branding.colors] || '#000000'}
                  onChange={(e) => updateOption(`branding.colors.${color}`, e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Typography
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Heading Font</label>
            <Select
              value={options.branding?.fonts?.heading || 'Arial, sans-serif'}
              onChange={(e) => updateOption('branding.fonts.heading', e.target.value)}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Body Font</label>
            <Select
              value={options.branding?.fonts?.body || 'Arial, sans-serif'}
              onChange={(e) => updateOption('branding.fonts.body', e.target.value)}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password Protection
        </label>
        <div className="flex items-center space-x-2">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={options.security?.password || ''}
            onChange={(e) => updateOption('security.password', e.target.value)}
            placeholder="Enter password (optional)"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for no password protection
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Encryption Level
        </label>
        <Select
          value={options.security?.encryption || 'AES-128'}
          onChange={(e) => updateOption('security.encryption', e.target.value)}
        >
          {encryptionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Permissions
        </label>
        <div className="space-y-3">
          {[
            { key: 'print', label: 'Allow printing' },
            { key: 'copy', label: 'Allow copying text' },
            { key: 'modify', label: 'Allow modifications' },
            { key: 'annotate', label: 'Allow annotations' },
          ].map((permission) => (
            <div key={permission.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={permission.key}
                checked={options.security?.permissions?.[permission.key as keyof typeof options.security.permissions] || false}
                onChange={(e) => updateOption(`security.permissions.${permission.key}`, e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={permission.key} className="text-sm text-gray-700 dark:text-gray-300">
                {permission.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSignatureTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Digital Certificate
        </label>
        <Input
          type="file"
          accept=".p12,.pfx,.crt,.cer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                updateOption('digitalSignature.certificate', base64);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload your digital certificate (.p12, .pfx, .crt, .cer)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Signature Reason
        </label>
        <Input
          type="text"
          value={options.digitalSignature?.reason || ''}
          onChange={(e) => updateOption('digitalSignature.reason', e.target.value)}
          placeholder="e.g., Document approval, Contract signing"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <Input
            type="text"
            value={options.digitalSignature?.location || ''}
            onChange={(e) => updateOption('digitalSignature.location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Information
          </label>
          <Input
            type="text"
            value={options.digitalSignature?.contactInfo || ''}
            onChange={(e) => updateOption('digitalSignature.contactInfo', e.target.value)}
            placeholder="e.g., john@company.com"
          />
        </div>
      </div>

      {options.digitalSignature?.certificate && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Digital certificate loaded successfully
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'format':
        return renderFormatTab();
      case 'branding':
        return renderBrandingTab();
      case 'security':
        return renderSecurityTab();
      case 'signature':
        return renderSignatureTab();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CogIcon className="h-5 w-5" />
          <span>PDF Export Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onPreview}
              disabled={isPreviewing}
            >
              {isPreviewing ? 'Generating Preview...' : 'Preview PDF'}
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOptionsChange(pdfExportService.getDefaultExportOptions())}
            >
              Reset to Defaults
            </Button>
            
            <Button
              onClick={onExport}
              disabled={isExporting}
            >
              {isExporting ? 'Generating PDF...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
