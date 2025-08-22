import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface AutoSaveOptions {
  key: string;
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
  onError?: (error: Error) => void;
  validate?: (data: any) => boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  recoveryData: any | null;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
): [AutoSaveState, () => void, () => void, () => void] {
  const {
    key,
    delay = 2000,
    enabled = true,
    onSave,
    onLoad,
    onError,
    validate,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    recoveryData: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<T>(data);

  // Generate unique key for this form instance
  const storageKey = `quotation_autosave_${key}`;
  const recoveryKey = `quotation_recovery_${key}`;

  // Save data to localStorage
  const saveToStorage = useCallback(async (dataToSave: T): Promise<void> => {
    try {
      // Validate data if validator is provided
      if (validate && !validate(dataToSave)) {
        throw new Error('Data validation failed');
      }

      // Save current data
      localStorage.setItem(storageKey, JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));

      // Save recovery data (last 3 versions)
      const recoveryData = JSON.parse(localStorage.getItem(recoveryKey) || '[]');
      recoveryData.unshift({
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0',
      });
      
      // Keep only last 3 versions
      if (recoveryData.length > 3) {
        recoveryData.splice(3);
      }
      
      localStorage.setItem(recoveryKey, JSON.stringify(recoveryData));

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));

      // Call onSave callback if provided
      if (onSave) {
        onSave(dataToSave);
      }

      retryCountRef.current = 0;
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          saveToStorage(dataToSave);
        }, retryDelay * retryCountRef.current);
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Auto-save failed',
        }));

        if (onError) {
          onError(error instanceof Error ? error : new Error('Auto-save failed'));
        }

        toast.error('Auto-save failed. Your changes may not be saved.');
        retryCountRef.current = 0;
      }
    }
  }, [storageKey, recoveryKey, validate, onSave, onError, maxRetries, retryDelay]);

  // Load data from localStorage
  const loadFromStorage = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.timestamp) {
          // Check if data is not too old (24 hours)
          const savedTime = new Date(parsed.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setState(prev => ({
              ...prev,
              lastSaved: savedTime,
              recoveryData: parsed.data,
            }));
            
            if (onLoad) {
              onLoad(parsed.data);
            }
            
            return parsed.data;
          } else {
            // Data is too old, remove it
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.error('Error loading auto-saved data:', error);
    }
    return null;
  }, [storageKey, onLoad]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(recoveryKey);
    setState(prev => ({
      ...prev,
      lastSaved: null,
      hasUnsavedChanges: false,
      error: null,
      recoveryData: null,
    }));
  }, [storageKey, recoveryKey]);

  // Manual save function
  const manualSave = useCallback(() => {
    if (enabled && data) {
      setState(prev => ({ ...prev, isSaving: true }));
      saveToStorage(data);
    }
  }, [enabled, data, saveToStorage]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !data) return;

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    lastDataRef.current = data;
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      if (enabled && data) {
        setState(prev => ({ ...prev, isSaving: true }));
        saveToStorage(data);
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, saveToStorage]);

  // Load saved data on mount
  useEffect(() => {
    if (enabled) {
      loadFromStorage();
    }
  }, [enabled, loadFromStorage]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  return [state, manualSave, loadFromStorage, clearSavedData];
}
