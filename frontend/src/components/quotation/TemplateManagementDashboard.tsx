import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  PlusIcon,
  DocumentTextIcon,
  FolderIcon,
  ShareIcon,
  CogIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { QuoteTemplate, templateManagementService } from '@/services/templateManagementService';
import { TemplateLibrary } from './TemplateLibrary';
import { TemplateCreationForm } from './TemplateCreationForm';
import { TemplatePreview } from './TemplatePreview';
import { toast } from 'react-hot-toast';

interface TemplateManagementDashboardProps {
  onTemplateSelect?: (template: QuoteTemplate) => void;
  onClose?: () => void;
}

export const TemplateManagementDashboard: React.FC<TemplateManagementDashboardProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('library');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleTemplateSelect = (template: QuoteTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleTemplateEdit = (template: QuoteTemplate) => {
    setEditingTemplate(template);
    setShowCreateForm(true);
    setActiveTab('create');
  };

  const handleTemplateDelete = (template: QuoteTemplate) => {
    // This will be handled by the TemplateLibrary component
    console.log('Template deleted:', template);
  };

  const handleTemplateDuplicate = (template: QuoteTemplate) => {
    // This will be handled by the TemplateLibrary component
    console.log('Template duplicated:', template);
  };

  const handleTemplateShare = (template: QuoteTemplate) => {
    // This will be handled by the TemplateLibrary component
    console.log('Template shared:', template);
  };

  const handleTemplateSave = (template: QuoteTemplate) => {
    if (editingTemplate) {
      toast.success('Template updated successfully');
      setEditingTemplate(null);
    } else {
      toast.success('Template created successfully');
    }
    setShowCreateForm(false);
    setActiveTab('library');
  };

  const handleTemplateCancel = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    setActiveTab('library');
  };

  const handleUseTemplate = (template: QuoteTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  const handleImportTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await templateManagementService.importTemplates(file);
      toast.success(`Successfully imported ${result.importedCount} templates`);
      setActiveTab('library');
    } catch (error) {
      console.error('Failed to import templates:', error);
      toast.error('Failed to import templates');
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExportTemplates = async () => {
    try {
      const blob = await templateManagementService.exportTemplates('json');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'templates_export.json';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Templates exported successfully');
    } catch (error) {
      console.error('Failed to export templates:', error);
      toast.error('Failed to export templates');
    }
  };

  const renderLibraryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse, manage, and organize your quote templates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportTemplates}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export All
          </Button>
          
          <label className="relative">
            <input
              type="file"
              accept=".json,.zip"
              onChange={handleImportTemplates}
              className="hidden"
            />
            <Button variant="outline" as="span" disabled={isImporting}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </label>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <TemplateLibrary
        onTemplateSelect={handleTemplateSelect}
        onTemplateEdit={handleTemplateEdit}
        onTemplateDelete={handleTemplateDelete}
        onTemplateDuplicate={handleTemplateDuplicate}
        onTemplateShare={handleTemplateShare}
      />
    </div>
  );

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {editingTemplate 
              ? 'Update your template settings and content' 
              : 'Design a new quote template with custom styling and variables'
            }
          </p>
        </div>

        <Button variant="outline" onClick={handleTemplateCancel}>
          Cancel
        </Button>
      </div>

      <TemplateCreationForm
        template={editingTemplate || undefined}
        onSave={handleTemplateSave}
        onCancel={handleTemplateCancel}
        mode={editingTemplate ? 'edit' : 'create'}
      />
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your templates into logical categories and subcategories
          </p>
        </div>

        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Category Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create and organize template categories to keep your library organized
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Template Search
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find templates using advanced filters, tags, and search criteria
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Search & Discovery
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Advanced search functionality is integrated into the Template Library tab
            </p>
            <Button onClick={() => setActiveTab('library')}>
              Go to Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSharingTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Template Sharing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share templates with team members and manage access permissions
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sharing & Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Template sharing functionality is available in the Template Library
            </p>
            <Button onClick={() => setActiveTab('library')}>
              Go to Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVersioningTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Template Versioning
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track changes, manage versions, and maintain template history
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Version Control
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Version management is integrated into template editing and library views
            </p>
            <Button onClick={() => setActiveTab('library')}>
              Go to Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Template Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track template usage, performance metrics, and user engagement
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Template analytics are integrated into the main dashboard
            </p>
            <Button onClick={() => setActiveTab('library')}>
              Go to Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Template Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure global template settings and preferences
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Configuration
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Template settings are managed within individual templates
            </p>
            <Button onClick={() => setActiveTab('library')}>
              Go to Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Template Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, organize, and manage your quote templates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Library</span>
          </TabsTrigger>
          
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Create</span>
          </TabsTrigger>
          
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <FolderIcon className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          
          <TabsTrigger value="sharing" className="flex items-center space-x-2">
            <ShareIcon className="h-4 w-4" />
            <span>Sharing</span>
          </TabsTrigger>
          
          <TabsTrigger value="versioning" className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Versioning</span>
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          {renderLibraryTab()}
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          {renderCreateTab()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          {renderSearchTab()}
        </TabsContent>

        <TabsContent value="sharing" className="mt-6">
          {renderSharingTab()}
        </TabsContent>

        <TabsContent value="versioning" className="mt-6">
          {renderVersioningTab()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {renderSettingsTab()}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] overflow-y-auto">
            <TemplateCreationForm
              template={editingTemplate || undefined}
              onSave={handleTemplateSave}
              onCancel={handleTemplateCancel}
              mode={editingTemplate ? 'edit' : 'create'}
            />
          </div>
        </div>
      )}

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </div>
  );
};
