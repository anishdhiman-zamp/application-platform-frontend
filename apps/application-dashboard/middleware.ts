import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/api/health-check', '/_next', '/favicon.ico', '/public'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

async function validateSession(request: NextRequest): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_DEV_API_URL || 'https://api-dev-aws-us.zamp.ai';

    const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Session validation error:', error);

    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = await validateSession(request);

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);

    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect_to', pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
