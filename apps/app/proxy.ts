import { type NextRequest, NextResponse } from 'next/server';
import { isBetterAuthMode } from './lib/auth-mode';
import { getAppRoute } from './lib/navigation-config';
import { authViewSegments } from './routes/auth';

const API_KEY_HEADER = 'x-deepcrawl-api-key';

const PUBLIC_AUTH_ROUTES = [
  `/${authViewSegments.login}`,
  `/${authViewSegments.signUp}`,
  `/${authViewSegments.verifyEmail}`,
  `/${authViewSegments.forgotPassword}`,
  `/${authViewSegments.resetPassword}`,
  `/${authViewSegments.callback}`,
];

function getStoredApiKey(): string | null {
  // This function will be called on the client side via a client-side script
  // For server-side, we can't access localStorage, so we need a different approach
  return null;
}

async function validateSessionWithApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/getSessionWithAPIKey`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ apiKey }),
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (!isBetterAuthMode()) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get(API_KEY_HEADER);
  const { pathname } = request.nextUrl;
  const isDeepcrawlAPIRoute = pathname.startsWith('/api/deepcrawl');

  // Allow public auth routes without authentication
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  // If we have an API key, validate it
  if (apiKey) {
    const isValid = await validateSessionWithApiKey(apiKey);
    if (!isValid) {
      if (isDeepcrawlAPIRoute) {
        return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
      }
      // For non-API routes, redirect to login
      return NextResponse.redirect(
        new URL(`/${authViewSegments.login}`, request.url),
      );
    }
    // Valid API key - allow the request
    return NextResponse.next();
  }

  // No API key - check if this is a logout or protected route
  // Logout requires session - redirect to login if no session
  if (pathname.startsWith(`/${authViewSegments.logout}`)) {
    return NextResponse.redirect(
      new URL(`/${authViewSegments.login}`, request.url),
    );
  }

  // Protect app routes - redirect unauthenticated users to login
  if (pathname.startsWith(getAppRoute())) {
    return NextResponse.redirect(
      new URL(`/${authViewSegments.login}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Remove /logout from exclusions since we handle it in middleware now
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/deepcrawl/:path*',
  ],
};
