import { useEffect, useCallback, useRef } from 'react';
import type { FurnitureItem } from '@/types/quote';

const STORAGE_KEY = 'isabey_quote_draft';
const DEBOUNCE_MS = 500;

export interface QuoteData {
  projectName: string;
  items: FurnitureItem[];
  rooms: string[];
  lastSaved: string;
}

/**
 * Load saved quote data from localStorage
 */
export function loadSavedQuote(): QuoteData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const data = JSON.parse(saved) as QuoteData;
    
    // Validate structure
    if (
      typeof data.projectName !== 'string' ||
      !Array.isArray(data.items) ||
      !Array.isArray(data.rooms)
    ) {
      console.warn('Invalid saved quote data structure');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load saved quote:', error);
    return null;
  }
}

/**
 * Clear saved quote data from localStorage
 */
export function clearSavedQuote(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved quote:', error);
  }
}

/**
 * Hook to persist quote data to localStorage with debouncing
 */
export function useQuotePersistence(
  projectName: string,
  items: FurnitureItem[],
  rooms: string[]
): { lastSaved: Date | null } {
  const lastSavedRef = useRef<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveQuote = useCallback(() => {
    try {
      const data: QuoteData = {
        projectName,
        items,
        rooms,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      lastSavedRef.current = new Date();
    } catch (error) {
      console.error('Failed to save quote:', error);
    }
  }, [projectName, items, rooms]);

  // Debounced auto-save on data changes
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      saveQuote();
    }, DEBOUNCE_MS);
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveQuote]);

  // Save immediately on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveQuote();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveQuote]);

  return { lastSaved: lastSavedRef.current };
}
