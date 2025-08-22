import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoSaveStatus } from '../AutoSaveStatus';
import { AutoSaveState } from '@/hooks/useAutoSave';

// Mock the date-fns function
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 minutes ago'),
}));

describe('AutoSaveStatus', () => {
  const mockState: AutoSaveState = {
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    recoveryData: null,
  };

  const mockHandlers = {
    onRecover: jest.fn(),
    onClear: jest.fn(),
    onManualSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no auto-save state is present', () => {
    const { container } = render(
      <AutoSaveStatus
        state={mockState}
        {...mockHandlers}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders when there are unsaved changes', () => {
    const stateWithChanges = {
      ...mockState,
      hasUnsavedChanges: true,
    };

    render(
      <AutoSaveStatus
        state={stateWithChanges}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.getByText('Save Now')).toBeInTheDocument();
  });

  it('renders when there is a last saved time', () => {
    const stateWithLastSaved = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
    };

    render(
      <AutoSaveStatus
        state={stateWithLastSaved}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Last saved/)).toBeInTheDocument();
  });

  it('renders when there is an error', () => {
    const stateWithError = {
      ...mockState,
      error: 'Auto-save failed',
    };

    render(
      <AutoSaveStatus
        state={stateWithError}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Auto-save failed')).toBeInTheDocument();
    expect(screen.getByText('Auto-save failed')).toBeInTheDocument();
  });

  it('renders when saving is in progress', () => {
    const stateWithSaving = {
      ...mockState,
      isSaving: true,
      hasUnsavedChanges: true,
    };

    render(
      <AutoSaveStatus
        state={stateWithSaving}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Save Now')).toBeDisabled();
  });

  it('calls onManualSave when Save Now button is clicked', () => {
    const stateWithChanges = {
      ...mockState,
      hasUnsavedChanges: true,
    };

    render(
      <AutoSaveStatus
        state={stateWithChanges}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Save Now'));
    expect(mockHandlers.onManualSave).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when clear button is clicked', () => {
    const stateWithLastSaved = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
    };

    render(
      <AutoSaveStatus
        state={stateWithLastSaved}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByLabelText(/clear/i));
    expect(mockHandlers.onClear).toHaveBeenCalledTimes(1);
  });

  it('shows recovery button when recovery data is available', () => {
    const stateWithRecovery = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
      recoveryData: { title: 'Test Quotation' },
    };

    render(
      <AutoSaveStatus
        state={stateWithRecovery}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Recovery')).toBeInTheDocument();
  });

  it('expands recovery info when recovery button is clicked', () => {
    const stateWithRecovery = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
      recoveryData: { title: 'Test Quotation' },
    };

    render(
      <AutoSaveStatus
        state={stateWithRecovery}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Recovery'));
    
    expect(screen.getByText('Recovery Data Available')).toBeInTheDocument();
    expect(screen.getByText('Restore Data')).toBeInTheDocument();
  });

  it('calls onRecover when restore button is clicked', () => {
    const stateWithRecovery = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
      recoveryData: { title: 'Test Quotation' },
    };

    render(
      <AutoSaveStatus
        state={stateWithRecovery}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Recovery'));
    fireEvent.click(screen.getByText('Restore Data'));
    
    expect(mockHandlers.onRecover).toHaveBeenCalledTimes(1);
  });

  it('displays auto-save information footer', () => {
    const stateWithLastSaved = {
      ...mockState,
      lastSaved: new Date('2023-01-01T00:00:00Z'),
    };

    render(
      <AutoSaveStatus
        state={stateWithLastSaved}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Auto-save enabled/)).toBeInTheDocument();
    expect(screen.getByText(/Data stored locally/)).toBeInTheDocument();
  });
});
