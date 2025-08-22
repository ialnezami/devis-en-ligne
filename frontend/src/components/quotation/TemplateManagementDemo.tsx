import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  PlusIcon,
  FolderIcon,
  ShareIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  DuplicateIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { TemplateManagementDashboard } from './TemplateManagementDashboard';
import { QuoteTemplate } from '@/services/templateManagementService';

export const TemplateManagementDemo: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);

  // Sample template data for demonstration
  const sampleTemplates: QuoteTemplate[] = [
    {
      id: '1',
      name: 'Professional Business Quote',
      description: 'A clean, professional template suitable for business-to-business quotes',
      category: 'Business',
      industry: 'consulting',
      tags: ['professional', 'clean', 'business'],
      isPublic: true,
      isDefault: false,
      rating: 4.8,
      ratingCount: 127,
      usageCount: 342,
      version: '2.1.0',
      content: {
        html: '<div class="quote-template">...</div>',
        css: '.quote-template { font-family: Arial, sans-serif; }',
        variables: [
          { id: '1', name: 'companyName', type: 'text', label: 'Company Name', defaultValue: '', required: true, validationRules: [] },
          { id: '2', name: 'quoteNumber', type: 'text', label: 'Quote Number', defaultValue: '', required: true, validationRules: [] }
        ]
      },
      metadata: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'user1',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5Qcm9mZXNzaW9uYWw8L3RleHQ+Cjwvc3ZnPgo='
    },
    {
      id: '2',
      name: 'Creative Design Quote',
      description: 'A modern, creative template perfect for design agencies and creative services',
      category: 'Creative',
      industry: 'design',
      tags: ['creative', 'modern', 'design'],
      isPublic: true,
      isDefault: false,
      rating: 4.6,
      ratingCount: 89,
      usageCount: 156,
      version: '1.5.2',
      content: {
        html: '<div class="creative-quote">...</div>',
        css: '.creative-quote { font-family: "Helvetica Neue", sans-serif; }',
        variables: [
          { id: '3', name: 'projectName', type: 'text', label: 'Project Name', defaultValue: '', required: true, validationRules: [] },
          { id: '4', name: 'designStyle', type: 'select', label: 'Design Style', defaultValue: 'modern', required: false, validationRules: [] }
        ]
      },
      metadata: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 15, right: 15, bottom: 15, left: 15 }
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'user2',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjZjBmOGZmIiBzdHJva2U9IiNjY2MiLz4KPHRleHQgeD0iMTAwIiB5PSIxMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNyZWF0aXZlPC90ZXh0Pgo8L3N2Zz4K'
    },
    {
      id: '3',
      name: 'Minimalist Quote',
      description: 'A simple, minimalist template focusing on content and readability',
      category: 'Minimal',
      industry: 'technology',
      tags: ['minimal', 'simple', 'clean'],
      isPublic: false,
      isDefault: true,
      rating: 4.9,
      ratingCount: 203,
      usageCount: 567,
      version: '3.0.1',
      content: {
        html: '<div class="minimal-quote">...</div>',
        css: '.minimal-quote { font-family: "Inter", sans-serif; }',
        variables: [
          { id: '5', name: 'clientName', type: 'text', label: 'Client Name', defaultValue: '', required: true, validationRules: [] },
          { id: '6', name: 'serviceType', type: 'select', label: 'Service Type', defaultValue: '', required: true, validationRules: [] }
        ]
      },
      metadata: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 25, right: 25, bottom: 25, left: 25 }
      },
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-25'),
      createdBy: 'user1',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHRleHQgeD0iMTAwIiB5PSIxMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPk1pbmltYWw8L3RleHQ+Cjwvc3ZnPgo='
    }
  ];

  const sampleCategories = [
    { id: '1', name: 'Business', color: 'blue', icon: '💼', description: 'Professional business templates' },
    { id: '2', name: 'Creative', color: 'purple', icon: '🎨', description: 'Creative and artistic templates' },
    { id: '3', name: 'Minimal', color: 'gray', icon: '⚪', description: 'Simple and clean templates' },
    { id: '4', name: 'Modern', color: 'green', icon: '🚀', description: 'Contemporary design templates' },
    { id: '5', name: 'Classic', color: 'brown', icon: '📜', description: 'Traditional and formal templates' }
  ];

  const handleTemplateSelect = (template: QuoteTemplate) => {
    setSelectedTemplate(template);
    // In a real app, this would navigate to quote creation with the selected template
    console.log('Selected template:', template);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return stars;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = sampleCategories.find(c => c.name === categoryName);
    return category?.color || 'gray';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = sampleCategories.find(c => c.name === categoryName);
    return category?.icon || '📄';
  };

  if (showDashboard) {
    return (
      <TemplateManagementDashboard
        onTemplateSelect={handleTemplateSelect}
        onClose={() => setShowDashboard(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
        <DocumentTextIcon className="h-20 w-20 text-blue-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Template Management System
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Create, organize, and manage professional quote templates with advanced features including 
          variable management, version control, sharing, and analytics.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" onClick={() => setShowDashboard(true)}>
            Launch Template Manager
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
          
          <Button variant="outline" size="lg">
            View Documentation
          </Button>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlusIcon className="h-6 w-6 text-blue-600" />
              <span>Template Creation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Create professional templates with HTML/CSS editor, variable management, and preview functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderIcon className="h-6 w-6 text-green-600" />
              <span>Category Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Organize templates into logical categories and subcategories for easy navigation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShareIcon className="h-6 w-6 text-purple-600" />
              <span>Sharing & Collaboration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Share templates with team members and manage access permissions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
              <span>Version Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Track changes, manage versions, and maintain template history.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <StarIcon className="h-6 w-6 text-yellow-600" />
              <span>Rating & Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Track template usage, performance metrics, and user engagement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRightIcon className="h-6 w-6 text-red-600" />
              <span>Import/Export</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Import templates from external sources and export for backup or sharing.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sample Templates Preview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sample Templates
          </h2>
          <Button variant="outline" onClick={() => setShowDashboard(true)}>
            View All Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    <Badge variant="outline" color={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  
                  {template.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(template.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({template.ratingCount})
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {template.usageCount} uses
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>v{template.version}</span>
                  <span>{template.updatedAt.toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="flex-1"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <DuplicateIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Template Categories
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                  <Badge variant="outline" color={category.color}>
                    {category.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Launch the template management system and start creating professional quote templates today.
        </p>
        <Button size="lg" onClick={() => setShowDashboard(true)}>
          Launch Template Manager
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
