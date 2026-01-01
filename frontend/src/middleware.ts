import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'main'
  
  // APP_MODE = 'main' → Block superadmin routes
  // APP_MODE = 'superadmin' → Only allow superadmin routes
  
  if (appMode === 'main') {
    // Block superadmin routes in main app
    if (pathname.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  if (appMode === 'superadmin') {
    // In superadmin mode, only allow superadmin and auth routes
    const allowedPaths = ['/superadmin', '/auth', '/_next', '/favicon.ico']
    const isAllowed = allowedPaths.some(p => pathname.startsWith(p)) || pathname === '/'
    
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url))
    }
    
    // Redirect home to superadmin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url))
    }
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // For protected routes, we'll handle authentication on the client side
  // since Zustand stores data in localStorage which is not accessible in middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
