import { useState, useCallback } from 'react';

interface FederatedContentState {
  isVisible: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useFederatedContent = (initialVisible = false) => {
  const [state, setState] = useState<FederatedContentState>({
    isVisible: initialVisible,
    isLoading: false,
    error: null,
  });

  const toggleVisibility = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: !prev.isVisible,
      error: null,
    }));
  }, []);

  const show = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      error: null,
    }));
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isVisible: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    toggleVisibility,
    show,
    hide,
    setLoading,
    setError,
    reset,
  };
};