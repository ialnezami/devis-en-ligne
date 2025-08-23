# Application Settings System

A comprehensive settings management system for configuring company information, branding, user roles, notifications, security policies, and system preferences.

## Overview

The Application Settings system provides a centralized interface for managing all application configuration settings. It's designed with a modular architecture that separates different setting categories into individual components while maintaining a unified user experience.

## Features

### 🏢 Company Settings
- **Company Information**: Name, legal name, registration number, industry
- **Address Management**: Street address, city, state, postal code, country
- **Contact Details**: Phone, email, website, support contact
- **Business Preferences**: Currency, timezone, language, fiscal year
- **Tax Information**: Tax ID, VAT number, business classification

### 🎨 Branding Configuration
- **Logo Management**: Primary and secondary logos with preview
- **Color Scheme**: Primary, secondary, accent colors with color picker
- **Typography**: Font families, sizes, weights for headings and body text
- **Custom CSS**: Advanced styling with live preview
- **Brand Assets**: Favicon, social media images, document templates

### 💰 Tax Rate Management
- **Tax Configuration**: VAT, GST, sales tax rates by country/region
- **Effective Dates**: Start and end dates for tax rate changes
- **Tax Categories**: Product, service, shipping, and exemption categories
- **Rate Calculation**: Automatic tax calculation and rounding rules
- **Compliance**: Tax reporting and documentation settings

### 👥 User Role Management
- **Role Creation**: Custom roles with descriptive names and descriptions
- **Permission System**: Granular permissions for all system features
- **System Roles**: Pre-defined roles (Admin, Manager, User, Viewer)
- **Access Control**: Module-level and feature-level permissions
- **Role Assignment**: User role assignment and role hierarchy

### 🔔 Notification Settings
- **Email Preferences**: Notification categories, frequency, quiet hours
- **Push Notifications**: Mobile and desktop push notification settings
- **In-App Notifications**: Real-time notification preferences
- **Delivery Settings**: Email templates, push notification content
- **Quiet Hours**: Do not disturb settings and timezone handling

### 🔒 Security Settings
- **Password Policies**: Minimum length, complexity requirements, expiration
- **Two-Factor Authentication**: TOTP, SMS, email verification options
- **Session Management**: Session timeout, concurrent login limits
- **Login Security**: Failed login attempts, IP restrictions, geolocation
- **Data Protection**: Encryption settings, backup policies, retention

### ⚙️ System Settings
- **Performance**: Caching, optimization, compression settings
- **Storage**: File limits, cleanup policies, retention rules
- **Logging**: Log levels, retention periods, export options
- **Maintenance**: Update schedules, maintenance windows, health checks
- **Integrations**: Third-party service configurations, API settings

## Architecture

### Component Structure

```
ApplicationSettings/
├── ApplicationSettings.tsx          # Main container with tabbed interface
├── CompanySettings.tsx             # Company information and preferences
├── BrandingConfiguration.tsx       # Visual identity and branding
├── TaxRateManagement.tsx           # Tax rates and compliance
├── UserRoleManagement.tsx          # User roles and permissions
├── NotificationSettings.tsx        # Notification preferences
├── SecuritySettings.tsx            # Security policies and settings
├── SystemSettings.tsx              # System configuration
└── ApplicationSettingsDemo.tsx     # Demo and showcase component
```

### State Management

Each settings component manages its own state independently while communicating changes to the parent `ApplicationSettings` component through the `onSettingsChange` callback. This allows for:

- **Centralized Change Tracking**: Parent component tracks all unsaved changes
- **Bulk Operations**: Save all changes at once or individually
- **Validation**: Real-time validation across all setting categories
- **Persistence**: Automatic saving and recovery of settings

### Data Flow

1. **Initialization**: Components load settings from API or local storage
2. **User Interaction**: Changes are tracked in local state
3. **Validation**: Real-time validation provides immediate feedback
4. **Change Notification**: Parent component is notified of changes
5. **Persistence**: Settings are saved to backend when requested

## Usage

### Basic Implementation

```tsx
import ApplicationSettings from './components/settings/ApplicationSettings';

function App() {
  const handleSettingsChange = (hasChanges: boolean) => {
    console.log('Settings have unsaved changes:', hasChanges);
  };

  return (
    <ApplicationSettings onSettingsChange={handleSettingsChange} />
  );
}
```

### Custom Settings Component

```tsx
import React, { useState, useEffect } from 'react';

interface CustomSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void;
}

export default function CustomSettings({ onSettingsChange }: CustomSettingsProps) {
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    onSettingsChange(true);
  };

  const handleSave = async () => {
    // Save settings to backend
    await saveSettings(settings);
    setHasChanges(false);
    onSettingsChange(false);
  };

  return (
    <div>
      {/* Settings form */}
      <button 
        onClick={handleSave}
        disabled={!hasChanges}
      >
        Save Changes
      </button>
    </div>
  );
}
```

### Demo Component

The `ApplicationSettingsDemo` component provides a showcase of all settings functionality:

```tsx
import ApplicationSettingsDemo from './components/settings/ApplicationSettingsDemo';

function DemoPage() {
  return <ApplicationSettingsDemo />;
}
```

## API Integration

### Settings Service

```typescript
// Example settings service interface
interface SettingsService {
  getCompanySettings(): Promise<CompanyInfo>;
  updateCompanySettings(settings: CompanyInfo): Promise<void>;
  getBrandingSettings(): Promise<BrandingConfig>;
  updateBrandingSettings(settings: BrandingConfig): Promise<void>;
  // ... other setting methods
}
```

### Data Models

```typescript
// Company Information
interface CompanyInfo {
  name: string;
  legalName: string;
  registrationNumber: string;
  industry: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    supportEmail: string;
  };
  preferences: {
    currency: string;
    timezone: string;
    language: string;
    fiscalYearStart: string;
  };
}

// Branding Configuration
interface BrandingConfig {
  logos: {
    primary: string;
    secondary: string;
    favicon: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSizes: Record<string, string>;
    bodySizes: Record<string, string>;
  };
  customCSS: string;
}
```

## Styling

### Design System

The Application Settings system uses a consistent design system based on:

- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Heroicons**: Consistent iconography throughout the interface
- **Color Palette**: Semantic colors for different setting categories
- **Typography**: Consistent font hierarchy and spacing
- **Dark Mode**: Full dark mode support with theme switching

### Responsive Design

- **Mobile First**: Optimized for mobile devices with progressive enhancement
- **Breakpoints**: Responsive layouts for tablet and desktop
- **Touch Friendly**: Optimized touch targets for mobile devices
- **Accessibility**: WCAG compliant with proper contrast and focus states

## Testing

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CompanySettings from './CompanySettings';

describe('CompanySettings', () => {
  it('should render company information form', () => {
    const mockOnChange = jest.fn();
    render(<CompanySettings onSettingsChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/legal name/i)).toBeInTheDocument();
  });

  it('should call onSettingsChange when form is modified', () => {
    const mockOnChange = jest.fn();
    render(<CompanySettings onSettingsChange={mockOnChange} />);
    
    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'New Company' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationSettings from './ApplicationSettings';

describe('ApplicationSettings Integration', () => {
  it('should track changes across all setting categories', () => {
    const mockOnChange = jest.fn();
    render(<ApplicationSettings onSettingsChange={mockOnChange} />);
    
    // Navigate to different tabs and make changes
    fireEvent.click(screen.getByText(/company settings/i));
    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    fireEvent.click(screen.getByText(/branding/i));
    const colorInput = screen.getByLabelText(/primary color/i);
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Settings components are loaded only when their tab is accessed
2. **Debounced Updates**: Form changes are debounced to prevent excessive API calls
3. **Memoization**: React.memo and useMemo for expensive computations
4. **Virtual Scrolling**: For large lists (e.g., user roles, tax rates)
5. **Image Optimization**: Logo and image compression for faster loading

### Bundle Size

- **Code Splitting**: Settings components are code-split by category
- **Tree Shaking**: Unused code is eliminated from the final bundle
- **Dynamic Imports**: Heavy components are loaded on-demand

## Security

### Data Protection

- **Input Validation**: All user inputs are validated on client and server
- **XSS Prevention**: Sanitized HTML rendering and secure form handling
- **CSRF Protection**: Token-based protection for form submissions
- **Permission Checks**: Role-based access control for sensitive settings
- **Audit Logging**: All setting changes are logged for compliance

### Access Control

- **Role-Based Access**: Different permission levels for different user roles
- **Feature Flags**: Granular control over which settings are visible
- **Environment Restrictions**: Certain settings locked in production
- **Admin Override**: Emergency access procedures for critical settings

## Internationalization

### Multi-Language Support

- **Localized Labels**: All UI text is internationalized
- **Regional Settings**: Date, time, and number formatting by locale
- **Currency Support**: Multi-currency display and conversion
- **Timezone Handling**: Automatic timezone detection and conversion
- **RTL Support**: Right-to-left language support

## Accessibility

### WCAG Compliance

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Handling**: Accessible error messages and validation feedback

## Browser Support

### Supported Browsers

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Polyfills

- **ES6+ Features**: Babel transpilation for older browsers
- **CSS Grid**: Fallback layouts for older browsers
- **Fetch API**: Polyfill for older browsers
- **Intersection Observer**: Polyfill for lazy loading

## Troubleshooting

### Common Issues

1. **Settings Not Saving**
   - Check network connectivity
   - Verify user permissions
   - Check browser console for errors

2. **Form Validation Errors**
   - Ensure all required fields are filled
   - Check input format requirements
   - Verify data types match expected format

3. **Performance Issues**
   - Clear browser cache
   - Check for large file uploads
   - Verify network latency

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug logging
localStorage.setItem('settings-debug', 'true');

// Check debug logs in console
console.log('Settings Debug Mode Enabled');
```

## Contributing

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

### Testing Guidelines

- **Unit Tests**: Test individual component functionality
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests through the issue tracker
- **Discussions**: Join community discussions for help and ideas
- **Email**: Contact the development team for urgent issues
