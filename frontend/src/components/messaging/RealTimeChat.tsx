import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { messagingService, Message, Conversation, TypingIndicator, MessageAttachment } from '../../services/messagingService';
import { toast } from 'react-hot-toast';

interface RealTimeChatProps {
  conversation: Conversation;
  onMessageSent?: (message: Message) => void;
  onMessageRead?: (messageId: string) => void;
  className?: string;
}

export default function RealTimeChat({ 
  conversation, 
  onMessageSent, 
  onMessageRead,
  className = '' 
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages on component mount and conversation change
  useEffect(() => {
    if (conversation) {
      loadMessages();
      markConversationAsRead();
    }
  }, [conversation]);

  // Set up WebSocket event handlers
  useEffect(() => {
    messagingService.onMessage(handleNewMessage);
    messagingService.onTyping(handleTypingIndicator);
    messagingService.onReadReceipt(handleReadReceipt);

    return () => {
      // Cleanup typing indicator when component unmounts
      if (isTyping) {
        messagingService.stopTyping(conversation.id);
      }
    };
  }, [conversation.id, isTyping]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (messageInput.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        messagingService.startTyping(conversation.id);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        messagingService.stopTyping(conversation.id);
      }, 3000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        messagingService.stopTyping(conversation.id);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, conversation.id, isTyping]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getMessages(conversation.id, { limit: 100 });
      setMessages(response.messages);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      await messagingService.markConversationAsRead(conversation.id);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.conversationId === conversation.id) {
      setMessages(prev => [...prev, message]);
      
      // Mark message as read if it's from another user
      if (message.senderId !== 'current-user-id') {
        messagingService.markMessageAsRead(message.id);
        onMessageRead?.(message.id);
      }
    }
  };

  const handleTypingIndicator = (typing: TypingIndicator) => {
    if (typing.conversationId === conversation.id) {
      setTypingUsers(prev => {
        const filtered = prev.filter(t => t.userId !== typing.userId);
        if (typing.isTyping) {
          return [...filtered, typing];
        }
        return filtered;
      });
    }
  };

  const handleReadReceipt = (data: { messageId: string; userId: string }) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, readBy: [...msg.readBy, data.userId] }
          : msg
      )
    );
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    try {
      const messageData = {
        content: messageInput.trim(),
        messageType: 'text' as const,
        attachments: attachments.length > 0 ? attachments : undefined,
        parentMessageId: replyToMessage?.id
      };

      const newMessage = await messagingService.sendMessage(
        conversation.id,
        messageData
      );

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setAttachments([]);
      setReplyToMessage(null);
      
      onMessageSent?.(newMessage);
      
      // Stop typing indicator
      setIsTyping(false);
      messagingService.stopTyping(conversation.id);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const updatedMessage = await messagingService.updateMessage(messageId, editContent);
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      );
      setEditingMessage(null);
      setEditContent('');
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await messagingService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startReply = (message: Message) => {
    setReplyToMessage(message);
    messageInputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyToMessage(null);
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

  const getReadStatusIcon = (message: Message) => {
    if (message.readBy.length === 0) {
      return <ClockIcon className="w-4 h-4 text-gray-400" />;
    } else if (message.readBy.length === 1) {
      return <CheckIcon className="w-4 h-4 text-blue-500" />;
    } else {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
  };

  const canEditMessage = (message: Message) => {
    return message.senderId === 'current-user-id' && !message.isDeleted;
  };

  const canDeleteMessage = (message: Message) => {
    return message.senderId === 'current-user-id' && !message.isDeleted;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversation.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation.participants.length} participants
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReadReceipts(!showReadReceipts)}
              className={`p-2 rounded-lg transition-colors ${
                showReadReceipts 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={showReadReceipts ? 'Hide read receipts' : 'Show read receipts'}
            >
              {showReadReceipts ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Reply Preview */}
              {message.parentMessageId && replyToMessage?.id === message.parentMessageId && (
                <div className="ml-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Replying to: {replyToMessage.senderName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {replyToMessage.content}
                  </p>
                </div>
              )}
              
              {/* Message */}
              <div className={`flex ${message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${message.senderId === 'current-user-id' ? 'order-2' : 'order-1'}`}>
                  {message.senderId !== 'current-user-id' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.senderName}
                      </span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-lg relative ${
                    message.senderId === 'current-user-id'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}>
                    {/* Reply Reference */}
                    {message.parentMessageId && (
                      <div className="mb-2 p-2 bg-black/10 dark:bg-white/10 rounded text-xs">
                        <p className="opacity-75">Replying to a message</p>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    {editingMessage === message.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMessage(message.id)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingMessage(null);
                              setEditContent('');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white/20 dark:bg-black/20 rounded">
                                {getFileIcon(attachment.mimeType)}
                                <span className="text-xs">{attachment.originalName}</span>
                                <span className="text-xs opacity-75">
                                  ({formatFileSize(attachment.size)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Message Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs opacity-75">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                            {message.isEdited && (
                              <span className="text-xs opacity-75">(edited)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {showReadReceipts && (
                              <div className="flex items-center space-x-1">
                                {getReadStatusIcon(message)}
                                <span className="text-xs opacity-75">
                                  {message.readBy.length}
                                </span>
                              </div>
                            )}
                            
                            {canEditMessage(message) && (
                              <button
                                onClick={() => {
                                  setEditingMessage(message.id);
                                  setEditContent(message.content);
                                }}
                                className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                              >
                                Edit
                              </button>
                            )}
                            
                            {canDeleteMessage(message) && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-xs opacity-75 hover:opacity-100 transition-opacity text-red-500"
                              >
                                Delete
                              </button>
                            )}
                            
                            <button
                              onClick={() => startReply(message)}
                              className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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
              <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Reply Preview */}
        {replyToMessage && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Replying to {replyToMessage.senderName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 truncate">
                  {replyToMessage.content}
                </p>
              </div>
              <button
                onClick={cancelReply}
                className="text-blue-500 hover:text-blue-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
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
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Attach files"
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
            placeholder={replyToMessage ? `Reply to ${replyToMessage.senderName}...` : "Type a message..."}
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
            title="Send message"
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
    </div>
  );
}
