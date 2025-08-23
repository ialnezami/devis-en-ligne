import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ArchiveBoxIcon,
  PinIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { messagingService, Conversation, Message, TypingIndicator } from '../../services/messagingService';
import { toast } from 'react-hot-toast';

interface MessagingInterfaceProps {
  className?: string;
}

export default function MessagingInterface({ className = '' }: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    title: '',
    type: 'direct' as const,
    participantIds: [] as string[]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
    
    // Set up WebSocket event handlers
    messagingService.onMessage(handleNewMessage);
    messagingService.onTyping(handleTypingIndicator);
    messagingService.onConversationUpdate(handleConversationUpdate);
    
    return () => {
      messagingService.disconnect();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConversations();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations({
        search: searchQuery,
        limit: 50
      });
      setConversations(response.conversations);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await messagingService.getMessages(conversationId, { limit: 100 });
      setMessages(response.messages);
      
      // Mark conversation as read
      await messagingService.markConversationAsRead(conversationId);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
    await loadMessages(conversation.id);
  };

  const handleNewMessage = (message: Message) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, message]);
      
      // Mark message as read if it's from another user
      if (message.senderId !== 'current-user-id') {
        messagingService.markMessageAsRead(message.id);
      }
    }
    
    // Update conversation list with new message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      )
    );
  };

  const handleTypingIndicator = (typing: TypingIndicator) => {
    if (selectedConversation && typing.conversationId === selectedConversation.id) {
      setTypingUsers(prev => {
        const filtered = prev.filter(t => t.userId !== typing.userId);
        if (typing.isTyping) {
          return [...filtered, typing];
        }
        return filtered;
      });
    }
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    
    if (selectedConversation?.id === updatedConversation.id) {
      setSelectedConversation(updatedConversation);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;

    try {
      const messageData = {
        content: messageInput.trim(),
        messageType: 'text' as const,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const newMessage = await messagingService.sendMessage(
        selectedConversation.id,
        messageData
      );

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setAttachments([]);
      
      // Update conversation with new message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateConversation = async () => {
    if (!newConversationData.title.trim() || newConversationData.participantIds.length === 0) {
      toast.error('Please provide a title and select participants');
      return;
    }

    try {
      const newConversation = await messagingService.createConversation(newConversationData);
      setConversations(prev => [newConversation, ...prev]);
      setShowNewConversationModal(false);
      setNewConversationData({ title: '', type: 'direct', participantIds: [] });
      toast.success('Conversation created successfully');
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error('Error creating conversation:', error);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await messagingService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success('Conversation archived');
    } catch (error) {
      toast.error('Failed to archive conversation');
      console.error('Error archiving conversation:', error);
    }
  };

  const handlePinConversation = async (conversationId: string) => {
    try {
      await messagingService.pinConversation(conversationId);
      loadConversations(); // Reload to get updated pin status
      toast.success('Conversation pinned');
    } catch (error) {
      toast.error('Failed to pin conversation');
      console.error('Error pinning conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <FilmIcon className="w-4 h-4" />;
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return <DocumentTextIcon className="w-4 h-4" />;
    return <DocumentTextIcon className="w-4 h-4" />;
  };

  return (
    <div className={`flex h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Conversation List */}
      {showConversationList && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Messages
              </h2>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
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
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.title}
                        </h3>
                        {conversation.isPinned && (
                          <PinIcon className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      
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
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <PinIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowConversationList(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </button>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.participants.length} participants
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <UserPlusIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === 'current-user-id' ? 'order-2' : 'order-1'}`}>
                      {message.senderId !== 'current-user-id' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <img
                            src={message.senderAvatar || '/default-avatar.png'}
                            alt={message.senderName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.senderName}
                          </span>
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.senderId === 'current-user-id'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white/20 rounded">
                                {getFileIcon(attachment.mimeType)}
                                <span className="text-xs">{attachment.originalName}</span>
                                <span className="text-xs opacity-75">
                                  ({formatFileSize(attachment.size)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.senderId === 'current-user-id' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                          {message.isEdited && ' (edited)'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {typingUsers.map(u => u.userName).join(', ')} typing...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getFileIcon(file.type)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() && attachments.length === 0}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              New Conversation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newConversationData.title}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter conversation title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newConversationData.type}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="direct">Direct Message</option>
                  <option value="group">Group Chat</option>
                  <option value="project">Project Discussion</option>
                  <option value="support">Support Chat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Participants (comma-separated IDs)
                </label>
                <input
                  type="text"
                  value={newConversationData.participantIds.join(',')}
                  onChange={(e) => setNewConversationData(prev => ({ 
                    ...prev, 
                    participantIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                  }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="user1, user2, user3"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
