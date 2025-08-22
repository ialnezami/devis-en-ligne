import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DuplicateIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { QuoteTemplate, TemplateCategory, TemplateSearchFilters, templateManagementService } from '@/services/templateManagementService';
import { toast } from 'react-hot-toast';

interface TemplateLibraryProps {
  onTemplateSelect?: (template: QuoteTemplate) => void;
  onTemplateEdit?: (template: QuoteTemplate) => void;
  onTemplateDelete?: (template: QuoteTemplate) => void;
  onTemplateDuplicate?: (template: QuoteTemplate) => void;
  onTemplateShare?: (template: QuoteTemplate) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onTemplateSelect,
  onTemplateEdit,
  onTemplateDelete,
  onTemplateDuplicate,
  onTemplateShare,
}) => {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TemplateSearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCategories();
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, filters, searchTerm, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const categoriesData = await templateManagementService.getTemplateCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await templateManagementService.getTemplates(filters, currentPage, 20);
      setTemplates(result.templates);
      setTotalPages(result.totalPages);
      setTotalTemplates(result.total);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term)) ||
        template.industry.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply other filters
    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter(template => filters.industry!.includes(template.industry));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(template =>
        template.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.isPublic !== undefined) {
      filtered = filtered.filter(template => template.isPublic === filters.isPublic);
    }

    if (filters.isDefault !== undefined) {
      filtered = filtered.filter(template => template.isDefault === filters.isDefault);
    }

    if (filters.rating) {
      filtered = filtered.filter(template => template.rating >= filters.rating!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof QuoteTemplate];
      let bValue: any = b[sortBy as keyof QuoteTemplate];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setTemplates(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTemplates();
  };

  const handleTemplateSelect = (template: QuoteTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleTemplateEdit = (template: QuoteTemplate) => {
    if (onTemplateEdit) {
      onTemplateEdit(template);
    }
  };

  const handleTemplateDelete = async (template: QuoteTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await templateManagementService.deleteTemplate(template.id);
        toast.success('Template deleted successfully');
        loadTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  const handleTemplateDuplicate = async (template: QuoteTemplate) => {
    const newName = prompt('Enter new template name:', `${template.name} (Copy)`);
    if (newName && newName.trim()) {
      try {
        const duplicatedTemplate = await templateManagementService.duplicateTemplate(template.id, newName);
        toast.success('Template duplicated successfully');
        loadTemplates();
        
        if (onTemplateDuplicate) {
          onTemplateDuplicate(duplicatedTemplate);
        }
      } catch (error) {
        console.error('Failed to duplicate template:', error);
        toast.error('Failed to duplicate template');
      }
    }
  };

  const handleTemplateShare = (template: QuoteTemplate) => {
    if (onTemplateShare) {
      onTemplateShare(template);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTemplates.length} templates?`)) {
      try {
        await templateManagementService.bulkDeleteTemplates(selectedTemplates);
        toast.success(`${selectedTemplates.length} templates deleted successfully`);
        setSelectedTemplates([]);
        loadTemplates();
      } catch (error) {
        console.error('Failed to delete templates:', error);
        toast.error('Failed to delete templates');
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to export');
      return;
    }

    try {
      const blob = await templateManagementService.bulkExportTemplates(selectedTemplates, 'zip');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `templates_export.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedTemplates.length} templates`);
    } catch (error) {
      console.error('Failed to export templates:', error);
      toast.error('Failed to export templates');
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectAllTemplates = () => {
    setSelectedTemplates(templates.map(template => template.id));
  };

  const clearSelection = () => {
    setSelectedTemplates([]);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'gray';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '📄';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                <Badge variant="outline" color={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
              
              <input
                type="checkbox"
                checked={selectedTemplates.includes(template.id)}
                onChange={() => toggleTemplateSelection(template.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
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
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>v{template.version}</span>
              <span>{formatDate(template.updatedAt)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="flex-1"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTemplateEdit(template)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTemplateDuplicate(template)}
              >
                <DuplicateIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTemplateShare(template)}
              >
                <ShareIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedTemplates.includes(template.id)}
                onChange={() => toggleTemplateSelection(template.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              <span className="text-2xl">{getCategoryIcon(template.category)}</span>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <Badge variant="outline" color={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <span className="text-sm text-gray-500">v{template.version}</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {template.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Updated: {formatDate(template.updatedAt)}</span>
                  <span>{template.usageCount} uses</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(template.rating)}
                    <span>({template.ratingCount})</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateEdit(template)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateDuplicate(template)}
                >
                  <DuplicateIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateShare(template)}
                >
                  <ShareIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateDelete(template)}
                  className="text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Template Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and manage your quote templates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search templates by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="usageCount">Usage Count</option>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={handleSearch} disabled={isLoading}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <Select
                  multiple
                  value={filters.industry || []}
                  onChange={(e) => handleFilterChange('industry', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <Select
                  multiple
                  value={filters.tags || []}
                  onChange={(e) => handleFilterChange('tags', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <Select
                  value={filters.isPublic?.toString() || ''}
                  onChange={(e) => handleFilterChange('isPublic', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                >
                  <option value="">All</option>
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <Select
                  value={filters.rating?.toString() || ''}
                  onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Star</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedTemplates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTemplates.length} templates selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
                
                <Button variant="outline" onClick={handleBulkExport}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                
                <Button variant="outline" onClick={handleBulkDelete} className="text-red-600">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Templates ({totalTemplates})</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllTemplates}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No templates found</p>
            </div>
          ) : (
            <div>
              {viewMode === 'grid' && renderTemplateGrid()}
              {viewMode === 'list' && renderTemplateList()}
              {viewMode === 'compact' && renderTemplateList()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} ({totalTemplates} total templates)
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
