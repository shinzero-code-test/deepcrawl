'use client';

import type { Session } from '@deepcrawl/auth/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const API_KEY_STORAGE_KEY = 'deepcrawl_api_key';

type ApiKeyAuthContextType = {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  isLoading: boolean;
  getSessionWithApiKey: () => Promise<Session | null>;
  clearAuth: () => void;
};

export const ApiKeyAuthContext = createContext<ApiKeyAuthContextType>({
  apiKey: null,
  setApiKey: () => {},
  session: null,
  setSession: () => {},
  isLoading: true,
  getSessionWithApiKey: async () => null,
  clearAuth: () => {},
});

export function ApiKeyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setApiKey = useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setApiKeyState(key);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKeyState(null);
    setSession(null);
  }, []);

  const getSessionWithApiKey = useCallback(async () => {
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/getSessionWithAPIKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          return null;
        }
        throw new Error('Failed to get session');
      }

      const data = await response.json();
      if (data?.user) {
        setSession(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get session with API key:', error);
      return null;
    }
  }, [apiKey, clearAuth]);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (apiKey && isLoading === false) {
      getSessionWithApiKey().catch((error) => {
        console.error('Failed to validate session on load:', error);
      });
    }
  }, [apiKey, isLoading, getSessionWithApiKey]);

  return (
    <ApiKeyAuthContext.Provider
      value={{
        apiKey,
        setApiKey,
        session,
        setSession,
        isLoading,
        getSessionWithApiKey,
        clearAuth,
      }}
    >
      {children}
    </ApiKeyAuthContext.Provider>
  );
}

export function useApiKeyAuth() {
  return useContext(ApiKeyAuthContext);
}
