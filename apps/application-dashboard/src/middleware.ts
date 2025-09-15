import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/api/health-check',
  '/_next',
  '/favicon.ico',
  '/public',
  '/icons',
  '/auth',
  '/mp4/zamp-login-bg.mp4',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

async function validateSession(request: NextRequest): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_DEV_API_URL || 'https://api-dev-aws-us.zamp.ai';

    const cookieHeader = Array.from(request.cookies.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include',
    });

    // console.log('response', cookieHeader);

    return response.ok;
  } catch (error) {
    console.error('Session validation error:', error);

    return false;
  }
}

export async function middleware(request: NextRequest) {
  // console.log('🚀 MIDDLEWARE STARTED - This should appear for every request!');

  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware running for pathname:', pathname);

  if (isPublicRoute(pathname)) {
    // console.log('✅ Public route, allowing access:', pathname);

    return NextResponse.next();
  }

  const isAuthenticated = await validateSession(request);

  // console.log('🔐 Protected route, validating session:', pathname, isAuthenticated);

  if (!isAuthenticated) {
    // console.log('❌ Authentication failed for:', pathname);

    if (pathname.startsWith('/api/')) {
      // console.log('🚫 API route - returning 401');

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);

    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect_to', pathname);
    }

    // console.log('🔄 Redirecting to login:', loginUrl.toString());

    return NextResponse.redirect(loginUrl);
  }

  // console.log('✅ Authentication successful for:', pathname);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
