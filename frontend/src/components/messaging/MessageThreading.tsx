import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  ReplyIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { messagingService, Message, MessageThread, Conversation } from '../../services/messagingService';
import { toast } from 'react-hot-toast';

interface MessageThreadingProps {
  conversation: Conversation;
  onThreadCreated?: (thread: MessageThread) => void;
  onThreadUpdated?: (thread: MessageThread) => void;
  className?: string;
}

export default function MessageThreading({ 
  conversation, 
  onThreadCreated, 
  onThreadUpdated,
  className = '' 
}: MessageThreadingProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [showThreadList, setShowThreadList] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingToThread, setReplyingToThread] = useState<string | null>(null);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Load threads on component mount
  useEffect(() => {
    if (conversation) {
      loadThreads();
    }
  }, [conversation]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      // This would typically come from the messaging service
      // For now, we'll simulate some threads
      const mockThreads: MessageThread[] = [
        {
          id: 'thread-1',
          conversationId: conversation.id,
          parentMessageId: 'msg-1',
          messages: [
            {
              id: 'msg-1',
              conversationId: conversation.id,
              senderId: 'user-1',
              senderName: 'John Doe',
              content: 'What do you think about the new quote template?',
              messageType: 'text',
              readBy: ['user-2'],
              createdAt: new Date(Date.now() - 3600000),
              updatedAt: new Date(Date.now() - 3600000),
              isEdited: false,
              isDeleted: false
            },
            {
              id: 'msg-2',
              conversationId: conversation.id,
              senderId: 'user-2',
              senderName: 'Jane Smith',
              content: 'I really like the new design! The layout is much cleaner.',
              messageType: 'text',
              readBy: ['user-1'],
              createdAt: new Date(Date.now() - 1800000),
              updatedAt: new Date(Date.now() - 1800000),
              isEdited: false,
              isDeleted: false
            }
          ],
          participantCount: 2,
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 1800000)
        }
      ];
      
      setThreads(mockThreads);
    } catch (error) {
      toast.error('Failed to load threads');
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleThreadExpansion = (threadId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const selectThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setShowThreadList(false);
  };

  const startReply = (threadId: string) => {
    setReplyingToThread(threadId);
    setReplyContent('');
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const sendReply = async (threadId: string) => {
    if (!replyContent.trim()) return;

    try {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const newMessage = await messagingService.sendMessage(conversation.id, {
        content: replyContent.trim(),
        messageType: 'text',
        threadId: threadId,
        parentMessageId: thread.parentMessageId
      });

      // Update thread with new message
      const updatedThread: MessageThread = {
        ...thread,
        messages: [...thread.messages, newMessage],
        updatedAt: new Date()
      };

      setThreads(prev => 
        prev.map(t => t.id === threadId ? updatedThread : t)
      );

      if (selectedThread?.id === threadId) {
        setSelectedThread(updatedThread);
      }

      setReplyContent('');
      setReplyingToThread(null);
      
      onThreadUpdated?.(updatedThread);
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error('Failed to send reply');
      console.error('Error sending reply:', error);
    }
  };

  const cancelReply = () => {
    setReplyingToThread(null);
    setReplyContent('');
  };

  const deleteThread = async (threadId: string) => {
    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      // This would typically call a backend endpoint to delete the thread
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
      
      toast.success('Thread deleted successfully');
    } catch (error) {
      toast.error('Failed to delete thread');
      console.error('Error deleting thread:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getThreadPreview = (thread: MessageThread) => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    return lastMessage?.content || 'No messages in thread';
  };

  const getUnreadCount = (thread: MessageThread) => {
    // This would typically check against the current user's read status
    return 0; // Placeholder
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Thread List */}
      {showThreadList && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Threads ({threads.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organized conversations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No threads yet</p>
                <p className="text-xs text-gray-400">Reply to a message to create a thread</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div key={thread.id} className="border-b border-gray-100 dark:border-gray-800">
                  {/* Thread Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => selectThread(thread)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Thread
                          </span>
                          {getUnreadCount(thread) > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                              {getUnreadCount(thread)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {getThreadPreview(thread)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {thread.messages.length} replies
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(thread.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleThreadExpansion(thread.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {expandedThreads.has(thread.id) ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Thread Preview */}
                  {expandedThreads.has(thread.id) && (
                    <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="space-y-2">
                        {thread.messages.slice(0, 3).map((message) => (
                          <div key={message.id} className="text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {message.senderName}:
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {message.content}
                              </span>
                            </div>
                          </div>
                        ))}
                        {thread.messages.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{thread.messages.length - 3} more messages
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startReply(thread.id);
                          }}
                          className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-700"
                        >
                          <ReplyIcon className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Thread Detail View */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowThreadList(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                  </button>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Thread Discussion
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedThread.messages.length} messages
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startReply(selectedThread.id)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {selectedThread.messages.map((message, index) => (
                <div key={message.id} className="space-y-2">
                  {/* Reply Preview for non-first messages */}
                  {index > 0 && (
                    <div className="ml-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Replying to: {selectedThread.messages[index - 1].senderName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {selectedThread.messages[index - 1].content}
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
                      
                      <div className={`p-3 rounded-lg ${
                        message.senderId === 'current-user-id'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {formatTime(message.createdAt)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs opacity-75">
                              {message.readBy.length} read
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {replyingToThread === selectedThread.id && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Replying to thread
                  </p>
                </div>
                
                <div className="flex items-end space-x-3">
                  <textarea
                    ref={replyInputRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelReply}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendReply(selectedThread.id)}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a thread
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a thread from the list to view the discussion
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
