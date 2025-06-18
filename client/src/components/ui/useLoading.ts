import { useState, useCallback } from "react";

interface UseLoadingOptions {
  initialLoading?: boolean;
  defaultMessage?: string;
}

interface LoadingState {
  isLoading: boolean;
  message: string;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialLoading = false, defaultMessage = "Loading..." } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    message: defaultMessage,
  });

  const startLoading = useCallback(
    (message?: string) => {
      setLoadingState({
        isLoading: true,
        message: message || defaultMessage,
      });
    },
    [defaultMessage]
  );

  const stopLoading = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState((prev) => ({
      ...prev,
      message,
    }));
  }, []);

  return {
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    startLoading,
    stopLoading,
    updateMessage,
  };
};

export default useLoading;
