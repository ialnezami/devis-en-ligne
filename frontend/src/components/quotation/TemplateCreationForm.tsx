import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CodeBracketIcon,
  PaletteIcon,
  CogIcon,
  DocumentTextIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { QuoteTemplate, TemplateVariable, TemplateCategory, templateManagementService } from '@/services/templateManagementService';
import { toast } from 'react-hot-toast';

interface TemplateCreationFormProps {
  template?: QuoteTemplate;
  onSave?: (template: QuoteTemplate) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  template,
  onSave,
  onCancel,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<Partial<QuoteTemplate>>({
    name: '',
    description: '',
    category: '',
    industry: '',
    tags: [],
    isPublic: false,
    isDefault: false,
    content: {
      html: '',
      css: '',
      variables: []
    },
    metadata: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  });

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    type: 'text',
    label: '',
    defaultValue: '',
    required: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    loadCategories();
    if (template) {
      setFormData(template);
    }
  }, [template]);

  useEffect(() => {
    generatePreview();
  }, [formData.content]);

  const loadCategories = async () => {
    try {
      const categoriesData = await templateManagementService.getTemplateCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const generatePreview = () => {
    if (!formData.content?.html) return;

    let preview = formData.content.html;
    
    // Replace variables with sample values
    formData.content.variables?.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      const sampleValue = variable.defaultValue || getSampleValue(variable.type);
      preview = preview.replace(new RegExp(placeholder, 'g'), sampleValue);
    });

    // Add CSS styling
    if (formData.content.css) {
      preview = `<style>${formData.content.css}</style>${preview}`;
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field: 'html' | 'css', value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        [field]: value
      }
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        [field]: value
      }
    }));
  };

  const handleMarginsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        margins: {
          ...prev.metadata!.margins,
          [field]: value
        }
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.type && newVariable.label) {
      const variable: TemplateVariable = {
        id: Date.now().toString(),
        name: newVariable.name,
        type: newVariable.type,
        label: newVariable.label,
        defaultValue: newVariable.defaultValue || '',
        required: newVariable.required || false,
        validationRules: newVariable.validationRules || []
      };

      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content!,
          variables: [...(prev.content?.variables || []), variable]
        }
      }));

      setNewVariable({
        name: '',
        type: 'text',
        label: '',
        defaultValue: '',
        required: false
      });
    }
  };

  const removeVariable = (variableId: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        variables: prev.content?.variables?.filter(v => v.id !== variableId) || []
      }
    }));
  };

  const updateVariable = (variableId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        variables: prev.content?.variables?.map(v => 
          v.id === variableId ? { ...v, [field]: value } : v
        ) || []
      }
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast.error('Template name is required');
      return false;
    }

    if (!formData.category) {
      toast.error('Template category is required');
      return false;
    }

    if (!formData.content?.html?.trim()) {
      toast.error('Template HTML content is required');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let savedTemplate: QuoteTemplate;

      if (mode === 'edit' && template) {
        savedTemplate = await templateManagementService.updateTemplate(template.id, formData);
        toast.success('Template updated successfully');
      } else {
        savedTemplate = await templateManagementService.createTemplate(formData);
        toast.success('Template created successfully');
      }

      if (onSave) {
        onSave(savedTemplate);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTemplate = async () => {
    if (!validateForm()) return;

    try {
      const result = await templateManagementService.validateTemplate(formData);
      if (result.isValid) {
        toast.success('Template validation passed!');
      } else {
        toast.error(`Template validation failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to validate template:', error);
      toast.error('Failed to validate template');
    }
  };

  const getVariableTypeOptions = () => [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'select', label: 'Select' },
    { value: 'textarea', label: 'Text Area' }
  ];

  const getPageSizeOptions = () => [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
    { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' }
  ];

  const getOrientationOptions = () => [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'edit' ? 'Update your template settings and content' : 'Design a new quote template with custom styling and variables'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleTestTemplate}>
            <CheckIcon className="h-4 w-4 mr-2" />
            Test Template
          </Button>
          
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Basic Info</span>
          </TabsTrigger>
          
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <CodeBracketIcon className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          
          <TabsTrigger value="variables" className="flex items-center space-x-2">
            <TagIcon className="h-4 w-4" />
            <span>Variables</span>
          </TabsTrigger>
          
          <TabsTrigger value="styling" className="flex items-center space-x-2">
            <PaletteIcon className="h-4 w-4" />
            <span>Styling</span>
          </TabsTrigger>
          
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter template name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <Select
                    value={formData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="education">Education</option>
                    <option value="real-estate">Real Estate</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button variant="outline" onClick={addTag}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your template"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic || false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Make template public
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Set as default template
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTML Content *
                </label>
                <Textarea
                  value={formData.content?.html || ''}
                  onChange={(e) => handleContentChange('html', e.target.value)}
                  placeholder="Enter your HTML template content. Use {{variable}} syntax for dynamic fields."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {{variableName}} to insert dynamic variables. Example: {{companyName}}, {{quoteNumber}}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSS Styling
                </label>
                <Textarea
                  value={formData.content?.css || ''}
                  onChange={(e) => handleContentChange('css', e.target.value)}
                  placeholder="Enter custom CSS styles for your template"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variables Tab */}
        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Variable</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input
                    type="text"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Variable name"
                  />
                  
                  <Select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {getVariableTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  
                  <Input
                    type="text"
                    value={newVariable.label}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Display label"
                  />
                  
                  <Input
                    type="text"
                    value={newVariable.defaultValue}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder="Default value"
                  />
                  
                  <Button onClick={addVariable} className="flex items-center justify-center">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.content?.variables && formData.content.variables.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Current Variables</h4>
                  {formData.content.variables.map((variable) => (
                    <div key={variable.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <span className="font-mono text-sm">{variable.name}</span>
                        <span className="text-sm">{variable.type}</span>
                        <span className="text-sm">{variable.label}</span>
                        <span className="text-sm">{variable.defaultValue}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={variable.required}
                            onChange={(e) => updateVariable(variable.id, 'required', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs">Required</span>
                        </label>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(variable.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Tab */}
        <TabsContent value="styling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Layout & Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Page Size
                  </label>
                  <Select
                    value={formData.metadata?.pageSize || 'A4'}
                    onChange={(e) => handleMetadataChange('pageSize', e.target.value)}
                  >
                    {getPageSizeOptions().map(option => (
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
                    value={formData.metadata?.orientation || 'portrait'}
                    onChange={(e) => handleMetadataChange('orientation', e.target.value)}
                  >
                    {getOrientationOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Margins (mm)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top</label>
                    <Input
                      type="number"
                      value={formData.metadata?.margins?.top || 20}
                      onChange={(e) => handleMarginsChange('top', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Right</label>
                    <Input
                      type="number"
                      value={formData.metadata?.margins?.right || 20}
                      onChange={(e) => handleMarginsChange('right', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bottom</label>
                    <Input
                      type="number"
                      value={formData.metadata?.margins?.bottom || 20}
                      onChange={(e) => handleMarginsChange('bottom', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Left</label>
                    <Input
                      type="number"
                      value={formData.metadata?.margins?.left || 20}
                      onChange={(e) => handleMarginsChange('left', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleInputChange('rating', star)}
                        className={`p-1 rounded ${
                          (formData.rating || 0) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version Number
                  </label>
                  <Input
                    type="text"
                    value={formData.version || '1.0.0'}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic || false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow other users to view and use this template
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Set as default template for new quotes
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
