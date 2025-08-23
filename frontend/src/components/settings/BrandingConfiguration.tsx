import React, { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  SwatchIcon, 
  DocumentTextIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface BrandingConfigurationProps {
  onSettingsChange: () => void;
}

interface BrandingConfig {
  logo: {
    primary: string | null;
    secondary: string | null;
    favicon: string | null;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: string;
  };
  customCSS: string;
}

export default function BrandingConfiguration({ onSettingsChange }: BrandingConfigurationProps) {
  const [branding, setBranding] = useState<BrandingConfig>({
    logo: {
      primary: null,
      secondary: null,
      favicon: null
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: '16px'
    },
    customCSS: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('logo');
  const [previewMode, setPreviewMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (type: keyof BrandingConfig['logo']) => {
    fileInputRef.current?.click();
    // Store the type for when file is selected
    (fileInputRef.current as any).dataset.logoType = type;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const logoType = event.target.dataset.logoType as keyof BrandingConfig['logo'];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setBranding(prev => ({
        ...prev,
        logo: {
          ...prev.logo,
          [logoType]: e.target?.result as string
        }
      }));
      onSettingsChange();
    };
    
    reader.readAsDataURL(file);
  };

  const handleColorChange = (colorType: keyof BrandingConfig['colors'], value: string) => {
    setBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }));
    onSettingsChange();
  };

  const handleTypographyChange = (fontType: keyof BrandingConfig['typography'], value: string) => {
    setBranding(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [fontType]: value
      }
    }));
    onSettingsChange();
  };

  const handleCustomCSSChange = (value: string) => {
    setBranding(prev => ({
      ...prev,
      customCSS: value
    }));
    onSettingsChange();
  };

  const removeLogo = (type: keyof BrandingConfig['logo']) => {
    setBranding(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        [type]: null
      }
    }));
    onSettingsChange();
  };

  const resetToDefaults = () => {
    setBranding({
      logo: {
        primary: null,
        secondary: null,
        favicon: null
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: '16px'
      },
      customCSS: ''
    });
    onSettingsChange();
  };

  const handleSave = async () => {
    setIsEditing(false);
    // Here you would typically save to the backend
    console.log('Branding configuration saved:', branding);
  };

  const tabs = [
    { id: 'logo', name: 'Logo & Images', icon: PhotoIcon },
    { id: 'colors', name: 'Colors', icon: SwatchIcon },
    { id: 'typography', name: 'Typography', icon: DocumentTextIcon },
    { id: 'custom', name: 'Custom CSS', icon: DocumentTextIcon }
  ];

  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Ubuntu'
  ];

  const renderLogoSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Logo */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Primary Logo
          </h4>
          <div className="relative">
            {branding.logo.primary ? (
              <div className="relative">
                <img
                  src={branding.logo.primary}
                  alt="Primary Logo"
                  className="w-32 h-32 object-contain mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                />
                <button
                  onClick={() => removeLogo('primary')}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mx-auto flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => handleLogoUpload('primary')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4 inline mr-2" />
              Upload Logo
            </button>
          </div>
        </div>

        {/* Secondary Logo */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Secondary Logo
          </h4>
          <div className="relative">
            {branding.logo.secondary ? (
              <div className="relative">
                <img
                  src={branding.logo.secondary}
                  alt="Secondary Logo"
                  className="w-32 h-32 object-contain mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                />
                <button
                  onClick={() => removeLogo('secondary')}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mx-auto flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => handleLogoUpload('secondary')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4 inline mr-2" />
              Upload Logo
            </button>
          </div>
        </div>

        {/* Favicon */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Favicon
          </h4>
          <div className="relative">
            {branding.logo.favicon ? (
              <div className="relative">
                <img
                  src={branding.logo.favicon}
                  alt="Favicon"
                  className="w-16 h-16 object-contain mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                />
                <button
                  onClick={() => removeLogo('favicon')}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mx-auto flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => handleLogoUpload('favicon')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4 inline mr-2" />
              Upload Favicon
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo Guidelines
        </h5>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Primary logo: Recommended size 200x200px, PNG or SVG format</li>
          <li>• Secondary logo: Recommended size 200x200px, PNG or SVG format</li>
          <li>• Favicon: 32x32px, ICO or PNG format</li>
          <li>• Use transparent backgrounds for best results</li>
        </ul>
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(branding.colors).map(([colorType, colorValue]) => (
          <div key={colorType}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {colorType} Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={colorValue}
                onChange={(e) => handleColorChange(colorType as keyof BrandingConfig['colors'], e.target.value)}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={colorValue}
                onChange={(e) => handleColorChange(colorType as keyof BrandingConfig['colors'], e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Color Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Color Preview
        </h5>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(branding.colors).map(([colorType, colorValue]) => (
            <div key={colorType} className="text-center">
              <div
                className="w-16 h-16 rounded-lg mx-auto mb-2 border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: colorValue }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {colorType}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypographySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Heading Font
          </label>
          <select
            value={branding.typography.headingFont}
            onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Body Font
          </label>
          <select
            value={branding.typography.bodyFont}
            onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base Font Size
          </label>
          <select
            value={branding.typography.fontSize}
            onChange={(e) => handleTypographyChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </select>
        </div>
      </div>

      {/* Typography Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Typography Preview
        </h5>
        <div className="space-y-4">
          <h1 
            className="text-3xl font-bold"
            style={{ fontFamily: branding.typography.headingFont }}
          >
            Heading 1 - {branding.typography.headingFont}
          </h1>
          <h2 
            className="text-2xl font-semibold"
            style={{ fontFamily: branding.typography.headingFont }}
          >
            Heading 2 - {branding.typography.headingFont}
          </h2>
          <p 
            className="text-base"
            style={{ 
              fontFamily: branding.typography.bodyFont,
              fontSize: branding.typography.fontSize
            }}
          >
            This is a sample paragraph using {branding.typography.bodyFont} at {branding.typography.fontSize}. 
            It demonstrates how your typography choices will look in the application.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCustomCSSSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom CSS
        </label>
        <textarea
          value={branding.customCSS}
          onChange={(e) => handleCustomCSSChange(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm dark:bg-gray-700 dark:text-white"
          placeholder="/* Add your custom CSS here */\n.custom-class {\n  color: #your-color;\n}"
        />
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CSS Guidelines
        </h5>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Use CSS custom properties for dynamic theming</li>
          <li>• Avoid !important declarations</li>
          <li>• Test your CSS in both light and dark modes</li>
          <li>• Keep selectors specific to avoid conflicts</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Branding Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your application's visual identity with logos, colors, and typography
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              previewMode
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <EyeIcon className="h-4 w-4 inline mr-2" />
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Branding
            </button>
          ) : (
            <>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Branding Preview
          </h3>
          <div className="space-y-4">
            {/* Logo Preview */}
            {branding.logo.primary && (
              <div className="flex items-center space-x-4">
                <img
                  src={branding.logo.primary}
                  alt="Logo Preview"
                  className="h-12 object-contain"
                />
                <span className="text-gray-600 dark:text-gray-400">Your logo will appear here</span>
              </div>
            )}
            
            {/* Color Preview */}
            <div className="flex space-x-2">
              {Object.entries(branding.colors).map(([colorType, colorValue]) => (
                <div
                  key={colorType}
                  className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: colorValue }}
                  title={colorType}
                />
              ))}
            </div>
            
            {/* Typography Preview */}
            <div>
              <h4 
                className="text-xl font-bold mb-2"
                style={{ fontFamily: branding.typography.headingFont }}
              >
                Sample Heading
              </h4>
              <p 
                style={{ 
                  fontFamily: branding.typography.bodyFont,
                  fontSize: branding.typography.fontSize
                }}
              >
                Sample text with your chosen typography settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'logo' && renderLogoSection()}
        {activeTab === 'colors' && renderColorsSection()}
        {activeTab === 'typography' && renderTypographySection()}
        {activeTab === 'custom' && renderCustomCSSSection()}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
