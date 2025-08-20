# Application Layout Components

This directory contains the core layout components that provide the structure and navigation for the Online Quotation Tool application.

## Components Overview

### MainLayout
The main application wrapper that provides:
- Responsive sidebar navigation
- Header with user controls
- Breadcrumb navigation
- Content area with proper spacing
- Mobile-responsive behavior

**Features:**
- Automatically handles mobile vs desktop layouts
- Closes sidebar on mobile when routes change
- Provides consistent spacing and structure
- Integrates with theme system

### Header
The top navigation bar containing:
- Application title
- Theme toggle (light/dark)
- Notification center with unread count
- User profile menu
- Mobile menu button

**Features:**
- Responsive design with mobile considerations
- Dropdown menus for notifications and user actions
- Theme switching with visual indicators
- Click-outside-to-close functionality

### Sidebar
The left navigation panel with:
- Hierarchical menu structure
- Collapsible sections
- Active route highlighting
- User information display
- Mobile overlay support

**Features:**
- Expandable/collapsible menu items
- Visual indicators for current page
- Responsive behavior (fixed on desktop, overlay on mobile)
- Smooth animations and transitions

### Breadcrumbs
Dynamic navigation breadcrumbs showing:
- Current page hierarchy
- Clickable navigation to parent pages
- Automatic generation from route structure
- Responsive design

**Features:**
- Automatically generated from current route
- Smart label formatting
- Home icon for root navigation
- Proper accessibility markup

## Usage

### Basic Layout
```tsx
import MainLayout from '@/components/layout/MainLayout';

function MyPage() {
  return (
    <MainLayout>
      <div>Your page content here</div>
    </MainLayout>
  );
}
```

### Custom Sidebar Items
The sidebar automatically generates navigation from the predefined menu structure. To add new items, modify the `menuItems` array in `Sidebar.tsx`.

### Theme Integration
All components automatically support light/dark themes through the `useTheme` hook. The theme state is persisted in localStorage and respects system preferences.

## Responsive Behavior

### Desktop (≥768px)
- Sidebar is fixed and always visible
- Header spans full width minus sidebar
- Content area adjusts to sidebar width

### Mobile (<768px)
- Sidebar becomes overlay with backdrop
- Header includes mobile menu button
- Sidebar closes automatically on route changes
- Touch-friendly interactions

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast theme support
- Focus management for dropdowns

## Customization

### Colors
Theme colors are defined in `tailwind.config.js` and automatically applied through CSS classes.

### Spacing
Consistent spacing is maintained through Tailwind's spacing scale and custom CSS variables.

### Icons
All icons use Heroicons for consistency. Replace icon components as needed.

## Dependencies

- `react-router-dom` - For navigation and routing
- `@heroicons/react` - For consistent iconography
- Custom hooks (`useTheme`, `useAuth`, `useNotifications`) - For state management

## Future Enhancements

- Collapsible sidebar on desktop
- Customizable sidebar width
- Advanced breadcrumb customization
- Enhanced mobile gestures
- Accessibility improvements
