# Messaging System

A comprehensive real-time messaging system for the quotation management application that provides instant communication, file sharing, and conversation organization.

## Features

### 🎯 Core Functionality
- **Real-Time Chat**: Instant messaging with WebSocket integration
- **File Sharing**: Drag & drop file uploads with progress tracking
- **Message Threading**: Organized conversation threads for better discussions
- **Advanced Search**: Powerful search with filters and relevance scoring
- **Typing Indicators**: Real-time typing status for active users
- **Read Receipts**: Message delivery and read status tracking
- **Conversation Management**: Organize and manage multiple conversations

### 💬 Messaging Types
- **Text Messages**: Standard text-based communication
- **File Attachments**: Images, videos, documents, and spreadsheets
- **Quote References**: Link messages to specific quotes
- **Threaded Replies**: Organized responses to specific messages
- **System Messages**: Automated notifications and updates

### 📁 File Support
- **Images**: JPEG, PNG, GIF, WebP formats
- **Videos**: MP4, WebM, OGG formats
- **Documents**: PDF, DOC, DOCX, TXT files
- **Spreadsheets**: XLS, XLSX files
- **Size Limit**: 10MB per file
- **Preview**: Thumbnail generation for supported formats

### 🔍 Search Capabilities
- **Full-Text Search**: Search through message content
- **Advanced Filters**: Date ranges, message types, senders
- **Relevance Scoring**: Intelligent result ranking
- **Conversation Context**: Search within specific conversations
- **Export Results**: Download search results in various formats

## Components

### 1. MessagingSystem.tsx
Main dashboard component that integrates all messaging features using a tabbed interface.

**Features:**
- Tabbed navigation between all messaging features
- Conversation sidebar with real-time updates
- Statistics dashboard and overview
- Responsive design with mobile support
- Dark mode compatibility

**Tabs:**
- **Chat**: Real-time messaging interface
- **Threads**: Message threading and organization
- **Files**: File sharing and management
- **Search**: Advanced message search
- **Overview**: Statistics and conversation management

### 2. MessagingInterface.tsx
Core messaging interface with conversation list and message area.

**Features:**
- Conversation list with search and filtering
- Message composition with file attachments
- Real-time message updates
- Conversation creation and management
- Archive and pin functionality

**State Management:**
- Conversations list with loading states
- Selected conversation and messages
- File attachments and upload progress
- Search queries and filters

### 3. RealTimeChat.tsx
Advanced real-time chat component with typing indicators and read receipts.

**Features:**
- Real-time message delivery via WebSocket
- Typing indicators for active users
- Read receipts and message status
- Message editing and deletion
- Reply functionality and threading
- File attachment support

**Real-Time Features:**
- WebSocket connection management
- Typing indicator synchronization
- Read receipt broadcasting
- Message status updates
- Connection reconnection handling

### 4. FileSharing.tsx
Comprehensive file sharing and management interface.

**Features:**
- Drag & drop file uploads
- File type validation and size limits
- Upload progress tracking
- File preview and management
- Thumbnail generation
- File organization and search

**Upload Features:**
- Multiple file selection
- Progress indicators
- Error handling and validation
- File type restrictions
- Size limit enforcement

### 5. MessageThreading.tsx
Message threading and conversation organization system.

**Features:**
- Thread creation and management
- Thread expansion and collapse
- Reply-to-message functionality
- Thread navigation and search
- Thread statistics and metrics

**Thread Management:**
- Parent-child message relationships
- Thread participant tracking
- Thread activity monitoring
- Thread archiving and deletion

### 6. MessageSearch.tsx
Advanced message search with filtering and relevance scoring.

**Features:**
- Full-text message search
- Advanced filtering options
- Date range selection
- Message type filtering
- Relevance scoring and ranking
- Search result export

**Search Options:**
- Content-based search
- Sender-based filtering
- Date range filtering
- Message type filtering
- Attachment filtering
- Read status filtering

### 7. TypingIndicators.tsx
Real-time typing indicators with multiple display variants.

**Components:**
- `TypingIndicators`: Standard typing indicator
- `EnhancedTypingIndicator`: Avatar-based typing display
- `CompactTypingIndicator`: Mobile-optimized indicator
- `CustomTypingIndicator`: Customizable styling variants

**Features:**
- Real-time typing status
- Multiple user support
- Animated indicators
- Customizable styling
- Responsive design

## Data Models

### Message Interface
```typescript
interface Message {
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
```

### Conversation Interface
```typescript
interface Conversation {
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
```

### MessageThread Interface
```typescript
interface MessageThread {
  id: string;
  conversationId: string;
  parentMessageId: string;
  messages: Message[];
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### TypingIndicator Interface
```typescript
interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
  startedAt: Date;
}
```

## API Integration

### MessagingService
The `MessagingService` class provides all API interactions and WebSocket management.

**Key Methods:**
- `getConversations()`: Fetch conversations with filtering
- `getMessages()`: Load messages for a conversation
- `sendMessage()`: Send new messages with attachments
- `updateMessage()`: Edit existing messages
- `deleteMessage()`: Delete messages
- `uploadFile()`: Upload file attachments
- `searchMessages()`: Search through messages
- `getMessageStats()`: Get messaging statistics

**WebSocket Features:**
- Real-time message delivery
- Typing indicator synchronization
- Read receipt broadcasting
- Connection management
- Automatic reconnection

### Service Endpoints
- `GET /api/messaging/conversations` - List conversations
- `POST /api/messaging/conversations` - Create conversation
- `GET /api/messaging/conversations/:id/messages` - Get messages
- `POST /api/messaging/conversations/:id/messages` - Send message
- `PUT /api/messaging/messages/:id` - Update message
- `DELETE /api/messaging/messages/:id` - Delete message
- `POST /api/messaging/upload` - Upload files
- `GET /api/messaging/search` - Search messages
- `GET /api/messaging/stats` - Get statistics

## Usage Examples

### Basic Messaging
```typescript
import { messagingService } from '../services/messagingService';

// Send a text message
const message = await messagingService.sendMessage(conversationId, {
  content: 'Hello, how are you?',
  messageType: 'text'
});

// Send a message with file attachment
const messageWithFile = await messagingService.sendMessage(conversationId, {
  content: 'Check out this document',
  messageType: 'text',
  attachments: [file]
});
```

### File Upload
```typescript
import { messagingService } from '../services/messagingService';

// Upload a file
const attachment = await messagingService.uploadFile(file, conversationId);

// Send message with attachment
await messagingService.sendMessage(conversationId, {
  content: 'File attached',
  messageType: 'text',
  attachments: [attachment]
});
```

### Real-Time Features
```typescript
import { messagingService } from '../services/messagingService';

// Listen for new messages
messagingService.onMessage((message) => {
  console.log('New message:', message);
});

// Listen for typing indicators
messagingService.onTyping((typing) => {
  console.log('User typing:', typing.userName);
});

// Start typing indicator
messagingService.startTyping(conversationId);

// Stop typing indicator
messagingService.stopTyping(conversationId);
```

### Message Search
```typescript
import { messagingService } from '../services/messagingService';

// Search messages
const results = await messagingService.searchMessages('quote template', {
  conversationId: 'conv-123',
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-12-31'),
  messageType: 'text'
});
```

## Configuration

### Environment Variables
```bash
# WebSocket configuration
REACT_APP_WS_URL=ws://localhost:3001/ws

# API configuration
REACT_APP_API_URL=http://localhost:3001/api

# File upload configuration
REACT_APP_MAX_FILE_SIZE=10485760  # 10MB in bytes
REACT_APP_ALLOWED_FILE_TYPES=image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx
```

### WebSocket Configuration
The messaging system automatically manages WebSocket connections:

**Connection Management:**
- Automatic connection on component mount
- Token-based authentication
- Automatic reconnection on disconnection
- Exponential backoff for reconnection attempts
- Connection status monitoring

**Message Types:**
- `message`: New message delivery
- `typing`: Typing indicator updates
- `read_receipt`: Read receipt notifications
- `conversation_update`: Conversation changes
- `user_status`: User online/offline status

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components load only when needed
- **Message Pagination**: Load messages in chunks
- **WebSocket Optimization**: Efficient message handling
- **File Upload Optimization**: Progress tracking and validation
- **Search Optimization**: Debounced search with caching

### Caching
- **Message Cache**: Recent messages cached in memory
- **Conversation Cache**: Conversation metadata cached
- **Search Cache**: Search results cached for performance
- **File Cache**: File metadata and previews cached

## Security Features

### Authentication & Authorization
- **Token-Based Auth**: JWT tokens for API access
- **WebSocket Auth**: Token validation for real-time connections
- **User Permissions**: Role-based access control
- **File Security**: Secure file upload and access

### Data Protection
- **Message Encryption**: End-to-end encryption support
- **File Validation**: File type and size validation
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Cross-site request forgery prevention

## Accessibility

### ARIA Support
- **aria-label**: Descriptive labels for interactive elements
- **aria-expanded**: Dropdown and thread state indication
- **aria-live**: Live region announcements for new messages
- **aria-describedby**: Element descriptions and help text

### Keyboard Navigation
- **Tab Order**: Logical tab sequence throughout
- **Arrow Keys**: Navigation within lists and grids
- **Enter/Space**: Activation of interactive elements
- **Escape**: Close modals and dropdowns

### Screen Reader Support
- **Semantic HTML**: Proper heading structure and landmarks
- **Alt Text**: Descriptive alt text for images and files
- **Status Messages**: Live status updates for screen readers
- **Focus Management**: Proper focus handling and restoration

## Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MessagingSystem } from './MessagingSystem';

test('renders messaging system', () => {
  render(<MessagingSystem />);
  expect(screen.getByText('Messages')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
import { messagingService } from '../services/messagingService';

test('sends message successfully', async () => {
  const message = await messagingService.sendMessage('conv-123', {
    content: 'Test message',
    messageType: 'text'
  });
  
  expect(message.id).toBeDefined();
  expect(message.content).toBe('Test message');
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('complete messaging workflow', async ({ page }) => {
  await page.goto('/messaging');
  await page.click('[data-testid="conversation-item"]');
  await page.fill('[data-testid="message-input"]', 'Hello world');
  await page.click('[data-testid="send-button"]');
  
  await expect(page.locator('text=Hello world')).toBeVisible();
});
```

## Browser Compatibility

### Supported Browsers
- **Chrome**: 88+ (Full support)
- **Firefox**: 85+ (Full support)
- **Safari**: 14+ (Full support)
- **Edge**: 88+ (Full support)

### Feature Support Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |
| Typing Indicators | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |

### Fallbacks
- **WebSocket**: Fallback to polling for unsupported browsers
- **File API**: Basic file input for older browsers
- **Drag & Drop**: Click-to-upload fallback
- **Modern CSS**: PostCSS autoprefixer for vendor prefixes

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
1. Check network connectivity
2. Verify WebSocket server is running
3. Check authentication token validity
4. Verify firewall settings

#### File Upload Issues
1. Check file size limits
2. Verify file type restrictions
3. Check network connectivity
4. Verify server storage configuration

#### Messages Not Delivering
1. Check WebSocket connection status
2. Verify user permissions
3. Check conversation access rights
4. Verify message validation

#### Search Not Working
1. Check search index status
2. Verify search permissions
3. Check query syntax
4. Verify filter parameters

### Debug Mode
Enable debug mode by setting the environment variable:
```bash
REACT_APP_MESSAGING_DEBUG=true
```

This will provide additional logging and debugging information.

## Future Enhancements

### Planned Features
- **Voice Messages**: Audio recording and playback
- **Video Calls**: Integrated video calling
- **Message Reactions**: Emoji reactions to messages
- **Message Pinning**: Pin important messages
- **Advanced Threading**: Nested thread support
- **Message Templates**: Predefined message templates

### Technical Improvements
- **Offline Support**: Enhanced offline message handling
- **Message Encryption**: End-to-end encryption
- **Performance Optimization**: Further performance improvements
- **Mobile App**: Native mobile application
- **API Versioning**: Backward-compatible API updates

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive documentation
- Include unit tests for new features

### Testing
- Write unit tests for all components
- Include integration tests for API calls
- Add E2E tests for critical workflows
- Maintain test coverage above 80%

## License

This messaging system is part of the quotation management application and follows the same licensing terms.
