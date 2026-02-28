'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useApiKeyAuth } from '@/components/providers/api-key-auth-provider';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

export function AuthCallback({ redirectTo }: { redirectTo?: string }) {
  const { onSuccess, isPending } = useOnSuccessTransition({ redirectTo });
  const { setApiKey, getSessionWithApiKey } = useApiKeyAuth();

  useEffect(() => {
    const createApiKeyAfterCallback = async () => {
      try {
        // Check if we already have an API key stored
        const storedKey = localStorage.getItem('deepcrawl_api_key');
        if (storedKey) {
          await onSuccess();
          return;
        }

        // Create an API key for cross-domain auth after OAuth callback
        // We need to use the authClient which should have a session now
        const { authClient } = await import('@/lib/auth.client');

        const { data: apiKeyData, error: apiKeyError } =
          await authClient.apiKey.create({
            name: 'Dashboard Session',
            expiresIn: 60 * 60 * 24 * 30, // 30 days
            prefix: 'dc_',
          });

        if (apiKeyError) {
          console.error('Failed to create API key after OAuth:', apiKeyError);
        } else if (apiKeyData?.key) {
          // Store the API key for session-based auth
          setApiKey(apiKeyData.key);

          // Also set a cookie for API routes to read
          document.cookie = `deepcrawl_api_key=${apiKeyData.key}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

          // Validate and get the session
          await getSessionWithApiKey();
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
      }

      await onSuccess();
    };

    createApiKeyAfterCallback();
  }, [onSuccess, setApiKey, getSessionWithApiKey]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          {isPending ? 'Completing authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
