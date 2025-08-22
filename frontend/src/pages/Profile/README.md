# User Profile Management System

## Overview

The User Profile Management System provides a comprehensive interface for users to manage their account information, preferences, and security settings. It's organized into five main sections accessible through a tabbed interface.

## Components

### 1. Profile (`Profile.tsx`)
The main container component that manages the tabbed interface and displays user information.

**Features:**
- Tabbed navigation between different profile sections
- User information display with avatar and status indicators
- Responsive design for mobile and desktop

**Tabs:**
- 👤 Profile - Basic profile information editing
- 🖼️ Avatar - Profile picture management
- 🔒 Password - Password change functionality
- ⚙️ Preferences - User preferences and settings
- 🔐 Two-Factor Auth - 2FA setup and management

### 2. Profile Edit Form (`ProfileEditForm.tsx`)
Allows users to edit their basic profile information.

**Fields:**
- First Name (required)
- Last Name (required)
- Email Address (required, validated)
- Username (required)
- Phone Number (optional)
- Company (optional)
- Position/Title (optional)

**Features:**
- Form validation with error messages
- Real-time error clearing
- Success/error notifications
- Integration with Redux store

### 3. Avatar Upload (`AvatarUpload.tsx`)
Manages profile picture uploads and display.

**Features:**
- File selection with drag & drop support
- Image preview before upload
- File validation (type, size)
- Avatar removal functionality
- Tips for best results
- Fallback to user initials when no avatar is set

**Supported Formats:**
- JPG, PNG, GIF
- Maximum size: 5MB
- Recommended: Square images for best results

### 4. Password Change (`PasswordChange.tsx`)
Secure password change functionality with strength validation.

**Features:**
- Current password verification
- New password with strength requirements
- Password confirmation
- Real-time strength indicator
- Password visibility toggles
- Comprehensive validation rules

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Different from current password

### 5. User Preferences (`UserPreferences.tsx`)
Comprehensive user preference management system.

**Categories:**

**Appearance & Language:**
- Theme (Light/Dark/System)
- Language (English/French/Spanish)
- Timezone selection
- Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time format (12-hour/24-hour)

**Notifications:**
- Email notifications
- Push notifications
- SMS notifications
- Marketing communications

**Privacy Settings:**
- Profile visibility (Public/Private/Contacts)
- Online status display
- Message permissions

### 6. Two-Factor Authentication (`TwoFactorSetup.tsx`)
Complete 2FA setup and management interface.

**Setup Process:**
1. **Generate Secret** - Creates TOTP secret and QR code
2. **Verify Code** - User scans QR code and enters verification code
3. **Complete** - 2FA enabled with backup codes generated

**Features:**
- QR code generation for authenticator apps
- 10 backup codes for emergency access
- Backup code regeneration
- 2FA disable functionality
- Comprehensive help and guidance

**Supported Apps:**
- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password

## Technical Implementation

### State Management
- Uses Redux for global state management
- Local component state for form data and UI state
- localStorage for preference persistence

### API Integration
- RTK Query for API calls
- Mutations for profile updates
- Queries for user data fetching

### Form Handling
- Controlled components with React hooks
- Client-side validation
- Error state management
- Loading states and feedback

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Responsive grid layouts
- Touch-friendly interactions

## Usage

### Accessing the Profile
Users can access their profile through:
1. Header user menu → Profile
2. Direct navigation to `/profile`

### Navigation
- Use tab navigation to switch between sections
- Each section is self-contained with its own form
- Changes are saved independently per section

### Security Features
- All forms require authentication
- Password changes require current password verification
- 2FA setup includes backup code generation
- Sensitive operations require additional verification

## Future Enhancements

### Planned Features
- Profile picture cropping and editing
- Advanced notification preferences
- Language-specific content
- Profile export/import
- Social media integration

### API Integration
- Real avatar upload endpoints
- User preference synchronization
- 2FA API integration
- Profile analytics and insights

## Dependencies

### Core Dependencies
- React 18+
- TypeScript
- Redux Toolkit
- RTK Query
- React Router

### UI Dependencies
- Tailwind CSS
- Heroicons
- Custom components

### State Management
- Redux store integration
- Custom hooks for authentication
- Local storage utilities

## Testing

### Component Testing
- Unit tests for form validation
- Integration tests for API calls
- User interaction testing
- Responsive design testing

### Accessibility
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Security Considerations

### Data Protection
- Sensitive data excluded from responses
- Secure password handling
- 2FA secret protection
- Backup code security

### User Privacy
- Configurable profile visibility
- Notification preferences
- Data export controls
- Account deletion options

## Support

For technical support or feature requests related to the Profile Management System, please contact the development team or refer to the project documentation.
