'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { APIError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: APIError | null;
}

interface UseApiOptions {
  autoFetch?: boolean;
}

/**
 * Hook for making API requests with loading and error states
 */
export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { autoFetch: true },
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: options.autoFetch || false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
      }

      const data = await apiClient.get<T>(endpoint);
      setState({
        data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        isLoading: false,
        error,
      });
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.autoFetch) {
      fetch();
    }
  }, [endpoint, options.autoFetch, fetch]);

  return { ...state, refetch: fetch };
}

/**
 * Hook for POST requests (creating/updating data)
 */
export function usePost<T>(endpoint: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const post = useCallback(
    async (body: Record<string, any>) => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          apiClient.setAuthToken(token);
        }

        const data = await apiClient.post<T>(endpoint, body);
        setIsLoading(false);
        return data;
      } catch (err: any) {
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [endpoint],
  );

  return { post, isLoading, error };
}

/**
 * Hook for PATCH requests (partial updates)
 */
export function usePatch<T>(endpoint: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const patch = useCallback(
    async (body: Record<string, any>) => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          apiClient.setAuthToken(token);
        }

        const data = await apiClient.patch<T>(endpoint, body);
        setIsLoading(false);
        return data;
      } catch (err: any) {
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [endpoint],
  );

  return { patch, isLoading, error };
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T>(endpoint: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const deleteItem = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
      }

      const data = await apiClient.delete<T>(endpoint);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, [endpoint]);

  return { deleteItem, isLoading, error };
}
