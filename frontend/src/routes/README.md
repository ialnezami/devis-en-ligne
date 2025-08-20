# Routing System

This directory contains the complete routing system for the Online Quotation Tool frontend application, including route protection, lazy loading, and role-based access control.

## Architecture Overview

The routing system is built on React Router v6 with the following key features:

- **Route Protection**: Authentication-based route guards
- **Role-Based Access**: Role-specific route restrictions
- **Lazy Loading**: Code splitting for better performance
- **404 Handling**: Proper error page routing
- **Public Routes**: Unauthenticated user access
- **Route Configuration**: Centralized route management

## Components

### AppRoutes
The main routing component that renders all application routes with proper protection and lazy loading.

**Features:**
- Suspense wrapper for lazy-loaded components
- Authentication state checking
- Route protection enforcement
- Loading states during authentication checks

### RouteGuard
Protects routes based on authentication status and user roles.

**Props:**
- `children`: React components to render
- `requiredRoles`: Array of roles required to access the route
- `fallbackPath`: Path to redirect unauthenticated users (default: '/login')

**Usage:**
```tsx
<RouteGuard requiredRoles={['admin', 'manager']}>
  <AdminPanel />
</RouteGuard>
```

### PublicRoute
Handles public routes and redirects authenticated users.

**Props:**
- `children`: React components to render
- `redirectPath`: Path to redirect authenticated users (default: '/dashboard')

**Usage:**
```tsx
<PublicRoute>
  <Login />
</PublicRoute>
```

## Route Configuration

### routes.config.ts
Centralized configuration file defining all application routes.

**Route Structure:**
```typescript
interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  protected: boolean;
  requiredRoles?: string[];
  children?: RouteConfig[];
}
```

**Route Categories:**
- **Public Routes**: Login, register, password reset
- **Protected Routes**: Dashboard, quotations, clients, analytics, files, settings
- **Error Routes**: 404 page handling

### Route Protection Levels

1. **Public Routes** (`protected: false`)
   - Accessible to all users
   - Redirects authenticated users to dashboard

2. **Protected Routes** (`protected: true`)
   - Requires authentication
   - No role restrictions

3. **Role-Restricted Routes** (`protected: true, requiredRoles: ['admin']`)
   - Requires authentication
   - Requires specific user roles

## Lazy Loading

All page components are lazy-loaded using React.lazy() for optimal performance:

```typescript
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
```

**Benefits:**
- Reduced initial bundle size
- Faster application startup
- Better user experience
- Improved performance metrics

## Role-Based Access Control

### Supported Roles
- `admin`: Full system access
- `manager`: Management-level access
- `sales_rep`: Sales representative access
- `client`: Limited client access

### Role Restrictions by Route

**Admin Only:**
- `/settings/integrations`

**Admin & Manager:**
- `/quotations/templates`
- `/analytics/reports`
- `/analytics/export`
- `/settings/company`

**Admin, Manager & Sales Rep:**
- `/quotations/create`
- `/clients/create`

**All Authenticated Users:**
- `/dashboard`
- `/quotations`
- `/clients`
- `/analytics`
- `/files`
- `/settings/profile`
- `/settings/notifications`

## Navigation Integration

### useRoutes Hook
Provides route information and navigation utilities:

```typescript
const {
  currentRoute,
  isProtectedRoute,
  requiredRoles,
  breadcrumbs,
  navigationItems,
  canAccessRoute
} = useRoutes();
```

**Features:**
- Current route information
- Breadcrumb generation
- Navigation menu items
- Route access validation

### Breadcrumb System
Automatically generates breadcrumbs based on current route:

```typescript
// Route: /quotations/create
// Breadcrumbs: Home > Quotations > Create New
```

## Error Handling

### 404 Page
Custom 404 page with:
- Clear error message
- Navigation options
- User-friendly interface
- Dark mode support

### Route Fallbacks
- Unauthenticated users → `/login`
- Unauthorized access → `/dashboard`
- Invalid routes → 404 page

## Performance Features

### Code Splitting
- Route-based code splitting
- Component-level lazy loading
- Suspense boundaries
- Loading indicators

### Bundle Optimization
- Separate chunks for each route
- Reduced initial bundle size
- Faster page transitions
- Better caching strategies

## Security Features

### Authentication Guards
- Token validation
- Session management
- Automatic redirects
- State persistence

### Role Validation
- Server-side role verification
- Client-side access control
- Graceful fallbacks
- Audit logging support

## Development Workflow

### Adding New Routes
1. Create the page component
2. Add lazy import to `routes.config.ts`
3. Configure route protection and roles
4. Update navigation if needed
5. Test authentication and authorization

### Route Testing
- Test public access
- Test authenticated access
- Test role restrictions
- Test 404 handling
- Test navigation flows

## Future Enhancements

### Planned Features
- Route-level analytics
- Advanced caching strategies
- Route preloading
- Offline route handling
- A/B testing support

### Performance Improvements
- Route prefetching
- Smart loading strategies
- Bundle analysis
- Performance monitoring
