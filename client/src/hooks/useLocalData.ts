import { useState, useEffect, useCallback } from 'react';

// Custom hook to work with local storage data
// Provides a React Query-like API but uses local storage
export function useLocalData<T>(
  store: {
    getAll: () => T[];
    create: (data: any) => T;
    update: (id: string, data: any) => T | undefined;
    delete: (id: string) => boolean;
  },
  key: string
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from store
  const loadData = useCallback(() => {
    setIsLoading(true);
    const items = store.getAll();
    setData(items);
    setIsLoading(false);
  }, [store]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, loadData]);

  return { data, isLoading, refetch: loadData };
}

// Hook for user settings (single object, not array)
export function useLocalSettings(
  store: {
    get: () => any;
    update: (data: any) => any;
  }
) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    const settings = store.get();
    setData(settings);
    setIsLoading(false);
  }, [store]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettings') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  return { data, isLoading, refetch: loadData };
}
