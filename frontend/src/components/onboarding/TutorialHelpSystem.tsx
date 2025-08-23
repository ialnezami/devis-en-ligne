import React, { useState } from 'react';
import { 
  PlayIcon, 
  BookOpenIcon, 
  QuestionMarkCircleIcon,
  LightBulbIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  SearchIcon
} from '@heroicons/react/24/outline';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  thumbnail: string;
  videoUrl?: string;
  articleUrl?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
}

export default function TutorialHelpSystem() {
  const [activeTab, setActiveTab] = useState('tutorials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Quote Management',
      description: 'Learn the basics of creating and managing quotes in the system',
      duration: '15 min',
      category: 'Basics',
      difficulty: 'beginner',
      isCompleted: false,
      thumbnail: '/api/placeholder/300/200',
      videoUrl: 'https://example.com/video1',
      articleUrl: 'https://example.com/article1'
    },
    {
      id: 'client-management',
      title: 'Managing Your Client Database',
      description: 'Organize and maintain your client information effectively',
      duration: '20 min',
      category: 'Clients',
      difficulty: 'beginner',
      isCompleted: false,
      thumbnail: '/api/placeholder/300/200',
      videoUrl: 'https://example.com/video2',
      articleUrl: 'https://example.com/article2'
    },
    {
      id: 'template-customization',
      title: 'Customizing Quote Templates',
      description: 'Create professional-looking templates that match your brand',
      duration: '25 min',
      category: 'Templates',
      difficulty: 'intermediate',
      isCompleted: false,
      thumbnail: '/api/placeholder/300/200',
      videoUrl: 'https://example.com/video3',
      articleUrl: 'https://example.com/article3'
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features and Workflows',
      description: 'Master advanced features to streamline your quote process',
      duration: '30 min',
      category: 'Advanced',
      difficulty: 'advanced',
      isCompleted: false,
      thumbnail: '/api/placeholder/300/200',
      videoUrl: 'https://example.com/video4',
      articleUrl: 'https://example.com/article4'
    }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: 'faq-1',
      title: 'How to create your first quote?',
      content: 'Creating your first quote is simple. Start by selecting a template, add your company and client information, include products or services with pricing, and then review and send.',
      category: 'FAQ',
      tags: ['quotes', 'getting-started', 'basics'],
      lastUpdated: new Date()
    },
    {
      id: 'faq-2',
      title: 'Managing client information',
      content: 'Keep your client database organized by using categories, adding notes, and setting reminders for follow-ups.',
      category: 'FAQ',
      tags: ['clients', 'organization', 'management'],
      lastUpdated: new Date()
    }
  ];

  const categories = ['all', 'Basics', 'Clients', 'Templates', 'Advanced', 'FAQ'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleTutorialComplete = (tutorialId: string) => {
    // In a real app, this would update the tutorial completion status
    console.log(`Tutorial ${tutorialId} marked as completed`);
  };

  const tabs = [
    { id: 'tutorials', label: 'Tutorials', icon: PlayIcon },
    { id: 'help', label: 'Help Center', icon: QuestionMarkCircleIcon },
    { id: 'tips', label: 'Tips & Tricks', icon: LightBulbIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tutorials & Help System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to use the system effectively with our comprehensive tutorials and help resources
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
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
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tutorials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tutorial.category}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tutorial.duration}</span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {tutorial.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {tutorial.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      {tutorial.videoUrl && (
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          <VideoCameraIcon className="h-4 w-4 inline mr-1" />
                          Watch
                        </button>
                      )}
                      
                      {tutorial.articleUrl && (
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                          <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                          Read
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleTutorialComplete(tutorial.id)}
                        disabled={tutorial.isCompleted}
                        className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                          tutorial.isCompleted
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tutorial.isCompleted ? 'Completed' : 'Mark as Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                {helpArticles.map((article) => (
                  <div key={article.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {article.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Updated {article.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips & Tricks Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pro Tips & Best Practices
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Use Templates Effectively
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Create reusable templates for common quote types to save time and maintain consistency.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                        Organize Clients
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Use categories and tags to organize your client database for better relationship management.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                        Follow Up Automatically
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Set up automatic reminders for quote follow-ups to improve your conversion rate.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Track Performance
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Monitor your quote success rate and client engagement to optimize your sales process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
