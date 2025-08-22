# Auto-Save Functionality for Quotation Forms

This directory contains the implementation of auto-save functionality for quotation creation forms, providing a seamless user experience with automatic data persistence and recovery.

## Components

### 1. `useAutoSave` Hook (`@/hooks/useAutoSave.ts`)

A custom React hook that provides auto-save functionality with the following features:

- **Debounced Auto-save**: Automatically saves form data after a configurable delay (default: 2 seconds)
- **Local Storage Persistence**: Stores data in browser's localStorage with versioning
- **Recovery System**: Maintains up to 3 versions of saved data for recovery
- **Validation Support**: Integrates with custom validation functions
- **Error Handling**: Retry mechanism with configurable retry attempts
- **User Warnings**: Warns users before leaving with unsaved changes

#### Usage

```typescript
const [autoSaveState, manualSave, loadFromStorage, clearSavedData] = useAutoSave(
  formData,
  {
    key: 'unique_form_key',
    delay: 2000, // 2 seconds
    enabled: true,
    validate: (data) => validateFunction(data),
    onSave: (data) => console.log('Data saved:', data),
    onLoad: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Save failed:', error)
  }
);
```

#### Return Values

- `autoSaveState`: Object containing save status, timestamps, and error information
- `manualSave`: Function to trigger immediate save
- `loadFromStorage`: Function to load saved data from storage
- `clearSavedData`: Function to clear all saved data

### 2. `AutoSaveStatus` Component (`AutoSaveStatus.tsx`)

A UI component that displays the current auto-save status and provides user controls:

- **Status Indicators**: Shows saving state, last saved time, and errors
- **Recovery Options**: Allows users to restore previous versions
- **Manual Controls**: Provides buttons for manual save and data clearing
- **Visual Feedback**: Color-coded status indicators and progress states

#### Props

```typescript
interface AutoSaveStatusProps {
  state: AutoSaveState;
  onRecover: () => void;
  onClear: () => void;
  onManualSave: () => void;
}
```

### 3. `AutoSaveDemo` Component (`AutoSaveDemo.tsx`)

A demonstration component showcasing the auto-save functionality:

- **Interactive Form**: Simple form with various input types
- **Real-time Updates**: Shows last modified timestamp
- **Testing Instructions**: Provides step-by-step testing guidance
- **Complete Workflow**: Demonstrates save, recovery, and submission

## Utilities

### 1. `quotationValidation.ts`

Validation utilities specifically for quotation forms:

- **Data Validation**: Ensures form data meets minimum requirements
- **Content Checking**: Verifies sufficient content for saving
- **Data Sanitization**: Removes sensitive or unnecessary fields before storage

#### Functions

- `validateQuotationData(data)`: Validates quotation form data
- `hasMinimumContent(data)`: Checks if data has enough content to save
- `sanitizeQuotationData(data)`: Cleans data for storage

## Integration

### In QuotationCreationWizard

The auto-save functionality is integrated into the main quotation creation wizard:

1. **Hook Integration**: Uses `useAutoSave` with quotation-specific configuration
2. **Status Display**: Shows auto-save status above the form
3. **Form Updates**: Automatically triggers saves when form data changes
4. **Step Navigation**: Saves data when moving between wizard steps
5. **Form Completion**: Clears saved data when quotation is completed

### Configuration

```typescript
const [autoSaveState, manualSave, loadFromStorage, clearSavedData] = useAutoSave(
  sanitizeQuotationData(formData),
  {
    key: 'quotation_creation',
    delay: 2000,
    enabled: true,
    validate: (data) => {
      const validation = validateQuotationData(data as QuotationFormData);
      return validation.isValid && hasMinimumContent(data as QuotationFormData);
    },
    onSave: (data) => {
      // Update timestamps and log save
      setFormData(prev => ({ ...prev, updatedAt: new Date() }));
    },
    onLoad: (data) => {
      // Prompt user for recovery
      if (window.confirm('Recovery data found. Restore?')) {
        setFormData(prev => ({ ...prev, ...data, updatedAt: new Date() }));
      }
    }
  }
);
```

## Features

### Auto-Save Behavior

- **Trigger**: Automatically saves after 2 seconds of inactivity
- **Storage**: Saves to localStorage with unique keys
- **Versioning**: Maintains multiple versions for recovery
- **Validation**: Only saves valid data with sufficient content

### Recovery System

- **Multiple Versions**: Keeps last 3 saved versions
- **User Prompting**: Asks user before restoring data
- **Automatic Detection**: Detects recovery data on page load
- **Data Integrity**: Validates recovered data before restoration

### User Experience

- **Visual Feedback**: Clear status indicators and progress states
- **Manual Controls**: Options for immediate save and data clearing
- **Warning System**: Prevents accidental data loss
- **Seamless Integration**: Works transparently with existing forms

## Browser Support

- **Local Storage**: Requires localStorage support (IE8+, all modern browsers)
- **JSON Support**: Requires JSON.parse/stringify support
- **Event Handling**: Uses beforeunload event for navigation warnings

## Security Considerations

- **Local Storage**: Data is stored locally in the user's browser
- **Data Sanitization**: Sensitive fields are removed before storage
- **User Control**: Users can clear saved data at any time
- **No Server Storage**: Auto-save data is not transmitted to servers

## Performance

- **Debouncing**: Prevents excessive saves during rapid typing
- **Efficient Storage**: Only saves when data actually changes
- **Memory Management**: Limits stored versions to prevent storage bloat
- **Cleanup**: Automatically removes old data (24+ hours)

## Testing

Use the `AutoSaveDemo` component to test the functionality:

1. Fill out the form and watch for auto-save indicators
2. Refresh the page to test recovery
3. Close and reopen the tab to verify persistence
4. Use manual save buttons for immediate saving
5. Submit the form to test data clearing

## Future Enhancements

- **Cloud Sync**: Option to sync auto-save data across devices
- **Advanced Recovery**: More sophisticated version comparison and merging
- **Offline Support**: Enhanced offline functionality with service workers
- **Analytics**: Track auto-save usage and success rates
- **Custom Storage**: Support for different storage backends
