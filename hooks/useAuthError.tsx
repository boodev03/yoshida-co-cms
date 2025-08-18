"use client";

import { useState, useCallback } from 'react';

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useAuthError = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthAction = useCallback(async <T>(
    authFunction: () => Promise<T>
  ): Promise<AuthResult<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authFunction();
      setIsLoading(false);
      return {
        success: true,
        data: result
      };
    } catch (err) {
      setIsLoading(false);
      
      // Handle different types of errors gracefully
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      
      // Log error for debugging but don't let it bubble up to Next.js error boundary
      console.error('Auth action failed:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    handleAuthAction
  };
};