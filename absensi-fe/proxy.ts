import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const role = request.cookies.get('auth_role')?.value;
  const { pathname } = request.nextUrl;
  
  const isLoginPage = pathname === '/login' || pathname === '/' || pathname.startsWith('/register');

  if (role) {
    // If logged in and trying to access login or register page, redirect to dashboard
    if (pathname === '/login' || pathname === '/' || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    
    // Role-based route protection
    if (role === 'user' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    if (role === 'admin' && pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  } else {
    // If not logged in and trying to access protected routes, redirect to login
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      // Clear the cache when redirecting to login to be safe
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }
  }
  
  const response = NextResponse.next();
  
  // Prevent browser caching for all protected pages
  // This ensures that clicking the 'Back' button after logging out
  // will force a server request and correctly redirect to login.
  if (!isLoginPage) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }
  
  return response;
}

export const config = {
  matcher: [
    // Catch all routes except Next.js internals and static assets
    '/((?!_next|api|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
