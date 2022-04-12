'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SaveOptions {
  onSave: (data: any) => Promise<void>;
  interval?: number;
  debounce?: number;
}

/**
 * Hook for automatically saving data at intervals
 */
export function useAutoSave<T extends Record<string, any>>(
  data: T,
  options: SaveOptions,
) {
  const {
    onSave,
    interval = 5000, // 5 seconds by default
    debounce = 1000, // 1 second debounce
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);

  // Perform the actual save
  const performSave = useCallback(async () => {
    // Only save if data has changed
    if (JSON.stringify(lastDataRef.current) === JSON.stringify(data)) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(data);
      setLastSavedAt(new Date());
      lastDataRef.current = data;
    } catch (error: any) {
      setSaveError(error?.message || 'Save failed');
      console.error('[useAutoSave] Error saving data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  // Debounced save with interval
  useEffect(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounce);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, performSave, debounce]);

  // Set up interval-based auto-save
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      performSave();
    }, interval);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [interval, performSave]);

  // Save on unmount
  useEffect(() => {
    return () => {
      performSave();
    };
  }, [performSave]);

  return {
    isSaving,
    lastSavedAt,
    saveError,
    save: performSave,
  };
}

/**
 * Hook to track unsaved changes
 */
export function useUnsavedChanges<T extends Record<string, any>>(
  originalData: T,
  currentData: T,
) {
  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);

  useEffect(() => {
    if (hasChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [hasChanges]);

  return hasChanges;
}
