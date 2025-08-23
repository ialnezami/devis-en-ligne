import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interfaces for messaging system
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'document' | 'quote';
  attachments?: MessageAttachment[];
  quoteReference?: {
    quoteId: string;
    quoteNumber: string;
    amount: number;
  };
  threadId?: string;
  parentMessageId?: string;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  type: 'direct' | 'group' | 'project' | 'support';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastSeen?: Date;
  isOnline: boolean;
}

export interface MessageThread {
  id: string;
  conversationId: string;
  parentMessageId: string;
  messages: Message[];
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
  startedAt: Date;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  highlight: {
    content: string;
    sender: string;
  };
  relevance: number;
}

export interface MessageStats {
  totalMessages: number;
  totalConversations: number;
  unreadMessages: number;
  messagesThisWeek: number;
  activeConversations: number;
  averageResponseTime: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'conversation_update' | 'user_status';
  payload: any;
  timestamp: Date;
}

// Messaging service class
export class MessagingService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeWebSocket();
  }

  // WebSocket Management
  private initializeWebSocket() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found for WebSocket connection');
        return;
      }

      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  // Event Handlers
  public onMessage(handler: (message: Message) => void) {
    this.messageHandlers.set('message', handler);
  }

  public onTyping(handler: (typing: TypingIndicator) => void) {
    this.messageHandlers.set('typing', handler);
  }

  public onReadReceipt(handler: (data: { messageId: string; userId: string }) => void) {
    this.messageHandlers.set('read_receipt', handler);
  }

  public onConversationUpdate(handler: (conversation: Conversation) => void) {
    this.messageHandlers.set('conversation_update', handler);
  }

  public onUserStatus(handler: (data: { userId: string; isOnline: boolean }) => void) {
    this.messageHandlers.set('user_status', handler);
  }

  // Send WebSocket messages
  public sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        payload: { conversationId, isTyping },
        timestamp: new Date()
      }));
    }
  }

  public sendReadReceipt(messageId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'read_receipt',
        payload: { messageId },
        timestamp: new Date()
      }));
    }
  }

  // API Methods
  public async getConversations(params?: {
    type?: string;
    search?: string;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messaging/conversations`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  public async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messaging/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  public async createConversation(data: {
    title: string;
    type: string;
    participantIds: string[];
  }): Promise<Conversation> {
    try {
      const response = await axios.post(`${API_BASE_URL}/messaging/conversations`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  public async updateConversation(conversationId: string, data: Partial<Conversation>): Promise<Conversation> {
    try {
      const response = await axios.put(`${API_BASE_URL}/messaging/conversations/${conversationId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  public async archiveConversation(conversationId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/messaging/conversations/${conversationId}/archive`);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  public async pinConversation(conversationId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/messaging/conversations/${conversationId}/pin`);
    } catch (error) {
      console.error('Error pinning conversation:', error);
      throw error;
    }
  }

  public async getMessages(conversationId: string, params?: {
    limit?: number;
    offset?: number;
    before?: string;
    after?: string;
    threadId?: string;
  }): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messaging/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  public async sendMessage(conversationId: string, data: {
    content: string;
    messageType: string;
    attachments?: File[];
    threadId?: string;
    parentMessageId?: string;
    quoteReference?: {
      quoteId: string;
      quoteNumber: string;
      amount: number;
    };
  }): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('messageType', data.messageType);
      
      if (data.threadId) {
        formData.append('threadId', data.threadId);
      }
      
      if (data.parentMessageId) {
        formData.append('parentMessageId', data.parentMessageId);
      }
      
      if (data.quoteReference) {
        formData.append('quoteReference', JSON.stringify(data.quoteReference));
      }
      
      if (data.attachments) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/messaging/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async updateMessage(messageId: string, content: string): Promise<Message> {
    try {
      const response = await axios.put(`${API_BASE_URL}/messaging/messages/${messageId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  public async deleteMessage(messageId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/messaging/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  public async getMessageThread(threadId: string): Promise<MessageThread> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messaging/threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message thread:', error);
      throw error;
    }
  }

  public async searchMessages(query: string, params?: {
    conversationId?: string;
    senderId?: string;
    messageType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ results: MessageSearchResult[]; total: number }> {
    try {
      const searchParams = { query, ...params };
      const response = await axios.get(`${API_BASE_URL}/messaging/search`, { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  public async getMessageStats(): Promise<MessageStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messaging/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      throw error;
    }
  }

  public async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/messaging/messages/${messageId}/read`);
      this.sendReadReceipt(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  public async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/messaging/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  // File Upload
  public async uploadFile(file: File, conversationId: string): Promise<MessageAttachment> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const response = await axios.post(`${API_BASE_URL}/messaging/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Typing Indicators
  public startTyping(conversationId: string) {
    this.sendTypingIndicator(conversationId, true);
    
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      this.stopTyping(conversationId);
    }, 3000);
    
    this.typingTimeouts.set(conversationId, timeout);
  }

  public stopTyping(conversationId: string) {
    this.sendTypingIndicator(conversationId, false);
    
    const timeout = this.typingTimeouts.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(conversationId);
    }
  }

  // Cleanup
  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Clear message handlers
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const messagingService = new MessagingService();

// Export types for use in components
export type {
  Message,
  MessageAttachment,
  Conversation,
  ConversationParticipant,
  MessageThread,
  TypingIndicator,
  MessageSearchResult,
  MessageStats,
  WebSocketMessage,
};
