import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { messagingService, Conversation, Message, MessageStats } from '../../services/messagingService';
import { toast } from 'react-hot-toast';
import MessagingInterface from './MessagingInterface';
import RealTimeChat from './RealTimeChat';
import FileSharing from './FileSharing';
import MessageThreading from './MessageThreading';
import MessageSearch from './MessageSearch';
import TypingIndicators from './TypingIndicators';

interface MessagingSystemProps {
  className?: string;
}

export default function MessagingSystem({ className = '' }: MessagingSystemProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Load conversations and stats on component mount
  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations({ limit: 10 });
      setConversations(response.conversations);
      
      // Select first conversation if none selected
      if (response.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(response.conversations[0]);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const messageStats = await messagingService.getMessageStats();
      setStats(messageStats);
    } catch (error) {
      console.error('Error loading message stats:', error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = (message: Message) => {
    // Update conversation list with new message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, unreadCount: 0 }
          : conv
      )
    );
    
    // Refresh stats
    loadStats();
  };

  const handleMessageRead = (messageId: string) => {
    // Update conversation unread count
    if (selectedConversation) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) }
            : conv
        )
      );
    }
  };

  const handleFileUploaded = (attachment: any) => {
    toast.success('File uploaded successfully');
  };

  const handleFileRemoved = (attachmentId: string) => {
    toast.success('File removed successfully');
  };

  const handleThreadCreated = (thread: any) => {
    toast.success('Thread created successfully');
  };

  const handleThreadUpdated = (thread: any) => {
    toast.success('Thread updated successfully');
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate to the conversation and message
    const conversation = conversations.find(c => c.id === result.conversation.id);
    if (conversation) {
      setSelectedConversation(conversation);
      setActiveTab('chat');
      toast.success(`Navigated to message in ${conversation.title}`);
    }
  };

  const tabs = [
    {
      id: 'chat',
      name: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      description: 'Real-time messaging and conversations'
    },
    {
      id: 'threads',
      name: 'Threads',
      icon: ChatBubbleOvalLeftEllipsisIcon,
      description: 'Organized conversation threads'
    },
    {
      id: 'files',
      name: 'Files',
      icon: PaperClipIcon,
      description: 'File sharing and management'
    },
    {
      id: 'search',
      name: 'Search',
      icon: MagnifyingGlassIcon,
      description: 'Advanced message search'
    },
    {
      id: 'overview',
      name: 'Overview',
      icon: UserGroupIcon,
      description: 'Conversation overview and stats'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return selectedConversation ? (
          <RealTimeChat
            conversation={selectedConversation}
            onMessageSent={handleMessageSent}
            onMessageRead={handleMessageRead}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        );

      case 'threads':
        return selectedConversation ? (
          <MessageThreading
            conversation={selectedConversation}
            onThreadCreated={handleThreadCreated}
            onThreadUpdated={handleThreadUpdated}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation to view its threads
              </p>
            </div>
          </div>
        );

      case 'files':
        return selectedConversation ? (
          <FileSharing
            conversationId={selectedConversation.id}
            onFileUploaded={handleFileUploaded}
            onFileRemoved={handleFileRemoved}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <PaperClipIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation to manage its files
              </p>
            </div>
          </div>
        );

      case 'search':
        return (
          <MessageSearch
            conversationId={selectedConversation?.id}
            onResultClick={handleSearchResultClick}
          />
        );

      case 'overview':
        return (
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Messaging Overview
              </h2>
              
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <UserGroupIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversations</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <PaperAirplaneIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messagesThisWeek}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <CogIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.averageResponseTime)}m</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Conversations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Conversations
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.slice(0, 5).map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conversation.title}
                          </h4>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                              {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{conversation.participants.length} participants</span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Messages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {conversations.length} conversations
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </h3>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                        {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {conversation.lastMessage 
                          ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                          : new Date(conversation.createdAt).toLocaleDateString()
                        }
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
