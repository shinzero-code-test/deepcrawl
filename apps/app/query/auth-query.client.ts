import type {
  ListApiKeys,
  ListDeviceSessions,
  ListSessions,
  ListUserAccounts,
  Passkey,
  Session,
} from '@deepcrawl/auth/types';
import { authClient } from '@/lib/auth.client';
import type { ActiveOrganization } from '@/lib/auth.client-types';

/**
 * Get API key from localStorage if available
 */
function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('deepcrawl_api_key');
}

/**
 * Auth Client API Call:
 * the current authenticated session
 * Uses API key if available (for cross-domain auth), otherwise uses cookie-based session
 */
export async function getSession(): Promise<Session | null> {
  // Try API key first for cross-domain auth
  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const response = await fetch('/api/auth/getSessionWithAPIKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          return session;
        }
      } else if (response.status === 401) {
        // API key is invalid - clear it
        localStorage.removeItem('deepcrawl_api_key');
      }
    } catch (error) {
      console.error('Failed to get session with API key:', error);
    }
  }

  // Fall back to cookie-based session
  const { data: session, error } = await authClient.getSession();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to get session:',
      error.message,
    );
    throw new Error(error.message);
  }

  return session;
}

/**
 * Auth Client API Call:
 * all active sessions for the current user
 * @description listSessions returns all active sessions for the current user across all devices
 */
export async function listSessions(): Promise<ListSessions> {
  const { data: sessions, error } = await authClient.listSessions();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch active sessions:',
      error.message,
    );
    throw new Error(error.message);
  }

  return sessions;
}

/**
 * Auth Client API Call:
 * all device sessions for the current user
 * @description listDeviceSessions (from the multi-session plugin) returns sessions for different user accounts stored in the same browser/device.
 */
export async function listDeviceSessions(): Promise<ListDeviceSessions> {
  const { data: sessions, error } =
    await authClient.multiSession.listDeviceSessions();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch device sessions:',
      error.message,
    );
    throw new Error(error.message);
  }

  return sessions;
}

/**
 * Auth Client API Call:
 * the full organization details
 */
export async function getFullOrganization(): Promise<ActiveOrganization | null> {
  const { data: organization, error } =
    await authClient.organization.getFullOrganization();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch organization:',
      error.message,
    );
    throw new Error(error.message);
  }

  return organization;
}

/**
 * Auth Client API Call:
 * user's passkeys using Better Auth official API
 */
export async function listUserPasskeys(): Promise<Passkey[]> {
  const { data: passkeys, error } = await authClient.passkey.listUserPasskeys();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch passkeys:',
      error.message,
    );
    throw new Error(error.message);
  }

  return passkeys;
}

/**
 * Auth Client API Call:
 * user's linked OAuth accounts
 */
export async function listAccounts(): Promise<ListUserAccounts> {
  const { data: accounts, error } = await authClient.listAccounts();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch linked accounts:',
      error.message,
    );
    throw new Error(error.message);
  }

  return accounts;
}

/**
 * Auth Client API Call:
 * user's API keys
 */
export async function listApiKeys(): Promise<ListApiKeys> {
  const { data: apiKeys, error } = await authClient.apiKey.list();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch API keys:',
      error.message,
    );
    throw new Error(error.message);
  }

  return apiKeys;
}
