# Redux State Management

This directory contains the complete Redux Toolkit state management system for the online quotation tool frontend.

## Architecture Overview

The state management system is built using:
- **Redux Toolkit** - Modern Redux with simplified boilerplate
- **RTK Query** - Built-in data fetching and caching solution
- **TypeScript** - Full type safety throughout the system

## Store Structure

### Main Store (`index.ts`)
- Configures the Redux store with all slices and middleware
- Sets up RTK Query with proper middleware configuration
- Enables Redux DevTools in development mode

### Slices

#### 1. Authentication (`authSlice.ts`)
- **State**: User authentication, login/logout, token management
- **RTK Query**: Login, register, logout, refresh token, get current user
- **Features**: JWT token handling, localStorage persistence, role-based access

#### 2. User Management (`userSlice.ts`)
- **State**: User profiles, user list, profile updates
- **RTK Query**: CRUD operations for users, profile management, avatar uploads
- **Features**: Password changes, user activation/deactivation, role management

#### 3. Theme Management (`themeSlice.ts`)
- **State**: UI theme preferences, sidebar state, color schemes
- **Features**: Light/dark mode, sidebar collapse, localStorage persistence
- **Customization**: Colors, fonts, animations, layout preferences

#### 4. Notifications (`notificationSlice.ts`)
- **State**: In-app notifications, toast messages, notification preferences
- **Features**: Multiple notification types, auto-hide, sound settings
- **Quick Actions**: Success, error, warning, info notifications

#### 5. Quotations (`quotationSlice.ts`)
- **State**: Quotation management, filtering, pagination
- **RTK Query**: Full CRUD operations, status changes, exports
- **Features**: Draft management, client linking, PDF generation

#### 6. Clients (`clientSlice.ts`)
- **State**: Client database, filtering, relationship management
- **RTK Query**: Client CRUD, import/export, statistics
- **Features**: Tag management, industry tracking, revenue analytics

#### 7. Analytics (`analyticsSlice.ts`)
- **State**: Business metrics, charts, performance data
- **RTK Query**: Revenue charts, conversion funnels, top performers
- **Features**: Date filtering, export capabilities, real-time updates

## Usage

### Basic Hooks
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// In your component
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.auth.user);
```

### RTK Query Hooks
```typescript
import { useGetClientsQuery, useCreateClientMutation } from '@/store/slices/clientSlice';

// Query hook (auto-fetches and caches)
const { data: clients, isLoading, error } = useGetClientsQuery();

// Mutation hook
const [createClient, { isLoading: isCreating }] = useCreateClientMutation();

// Usage
const handleCreate = async (clientData) => {
  try {
    await createClient(clientData).unwrap();
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

### Async Thunks
```typescript
import { fetchClients } from '@/store/slices/clientSlice';

// In your component
const handleFetch = async () => {
  try {
    await dispatch(fetchClients({ page: 1, limit: 10 })).unwrap();
  } catch (error) {
    // Error handling
  }
};
```

## Key Features

### 1. Automatic Caching
- RTK Query automatically caches API responses
- Intelligent cache invalidation based on mutations
- Optimistic updates for better UX

### 2. Type Safety
- Full TypeScript integration
- Auto-generated types from API responses
- Compile-time error checking

### 3. Error Handling
- Centralized error management
- Automatic error state updates
- User-friendly error messages

### 4. Loading States
- Automatic loading indicators
- Optimistic UI updates
- Skeleton screens support

### 5. Offline Support
- Cached data available offline
- Queue mutations for when online
- Background sync capabilities

## Middleware Configuration

The store includes:
- **Serializable Check**: Prevents non-serializable values
- **RTK Query Middleware**: Handles API calls and caching
- **DevTools**: Redux DevTools integration for debugging

## Environment Configuration

Set these environment variables:
```bash
VITE_API_URL=http://localhost:3001/api
```

## Best Practices

### 1. Use RTK Query for API Calls
- Prefer RTK Query hooks over manual fetch calls
- Leverage automatic caching and invalidation
- Use the `unwrap()` method for error handling

### 2. Keep Slices Focused
- Each slice should handle one domain
- Avoid cross-slice dependencies
- Use selectors for complex state access

### 3. Optimize Re-renders
- Use `useAppSelector` with specific selectors
- Avoid selecting entire objects when possible
- Consider using `shallowEqual` for object comparisons

### 4. Handle Loading States
- Always check `isLoading` before rendering data
- Show skeleton screens during loading
- Handle error states gracefully

## Migration from Context API

If migrating from React Context:
1. Replace `useContext` with `useAppSelector`
2. Replace context providers with `StoreProvider`
3. Update state updates to use `dispatch` and actions
4. Leverage RTK Query for API calls

## Performance Considerations

- RTK Query automatically optimizes re-renders
- Use `useMemo` for expensive selectors
- Consider code splitting for large slices
- Monitor bundle size with Redux DevTools

## Testing

Each slice can be tested independently:
- Test reducers with simple action objects
- Test async thunks with mock dispatch
- Test RTK Query endpoints with mock responses
- Use Redux Toolkit's `configureStore` for testing
