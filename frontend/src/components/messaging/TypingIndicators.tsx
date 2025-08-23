import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { TypingIndicator } from '../../services/messagingService';

interface TypingIndicatorsProps {
  typingUsers: TypingIndicator[];
  conversationId: string;
  className?: string;
}

export default function TypingIndicators({ 
  typingUsers, 
  conversationId,
  className = '' 
}: TypingIndicatorsProps) {
  const [visibleTypingUsers, setVisibleTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    // Filter typing users for current conversation
    const filteredUsers = typingUsers.filter(user => user.conversationId === conversationId);
    setVisibleTypingUsers(filteredUsers);
  }, [typingUsers, conversationId]);

  if (visibleTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = (users: TypingIndicator[]) => {
    if (users.length === 1) {
      return `${users[0].userName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].userName} and ${users[1].userName} are typing...`;
    } else {
      const names = users.slice(0, -1).map(u => u.userName).join(', ');
      const lastName = users[users.length - 1].userName;
      return `${names}, and ${lastName} are typing...`;
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <UserCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
      
      <div className="max-w-xs lg:max-w-md">
        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {/* Typing Animation */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            
            {/* Typing Text */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getTypingText(visibleTypingUsers)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced typing indicator with user avatars
export function EnhancedTypingIndicator({ 
  typingUsers, 
  conversationId,
  className = '' 
}: TypingIndicatorsProps) {
  const [visibleTypingUsers, setVisibleTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    const filteredUsers = typingUsers.filter(user => user.conversationId === conversationId);
    setVisibleTypingUsers(filteredUsers);
  }, [typingUsers, conversationId]);

  if (visibleTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      {/* User Avatars */}
      <div className="flex -space-x-2">
        {visibleTypingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
            style={{ zIndex: visibleTypingUsers.length - index }}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {visibleTypingUsers.length > 3 && (
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">
            +{visibleTypingUsers.length - 3}
          </div>
        )}
      </div>
      
      {/* Typing Message */}
      <div className="max-w-xs lg:max-w-md">
        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {visibleTypingUsers.length === 1 
                ? `${visibleTypingUsers[0].userName} is typing...`
                : `${visibleTypingUsers.length} people are typing...`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact typing indicator for mobile
export function CompactTypingIndicator({ 
  typingUsers, 
  conversationId,
  className = '' 
}: TypingIndicatorsProps) {
  const [visibleTypingUsers, setVisibleTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    const filteredUsers = typingUsers.filter(user => user.conversationId === conversationId);
    setVisibleTypingUsers(filteredUsers);
  }, [typingUsers, conversationId]);

  if (visibleTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {visibleTypingUsers.length === 1 
          ? `${visibleTypingUsers[0].userName} typing...`
          : `${visibleTypingUsers.length} typing...`
        }
      </span>
    </div>
  );
}

// Typing indicator with custom styling
export function CustomTypingIndicator({ 
  typingUsers, 
  conversationId,
  variant = 'default',
  className = '' 
}: TypingIndicatorsProps & { variant?: 'default' | 'minimal' | 'fancy' }) {
  const [visibleTypingUsers, setVisibleTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    const filteredUsers = typingUsers.filter(user => user.conversationId === conversationId);
    setVisibleTypingUsers(filteredUsers);
  }, [typingUsers, conversationId]);

  if (visibleTypingUsers.length === 0) {
    return null;
  }

  switch (variant) {
    case 'minimal':
      return (
        <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
          <span className="inline-block animate-pulse">●</span> {visibleTypingUsers[0].userName} typing...
        </div>
      );
    
    case 'fancy':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {visibleTypingUsers[0].userName} is composing...
          </span>
        </div>
      );
    
    default:
      return <TypingIndicators typingUsers={typingUsers} conversationId={conversationId} className={className} />;
  }
}
