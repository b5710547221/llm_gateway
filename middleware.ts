import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Paths that require authentication
const protectedPaths = ['/gateway', '/admin']
const adminPaths = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path requires authentication
  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path))
  const requiresAdmin = adminPaths.some((path) => pathname.startsWith(path))

  if (requiresAuth) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const decoded = verifyToken(token)

      if (!decoded) {
        // Invalid token - redirect to login
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Check admin access
      if (requiresAdmin && decoded.role !== 'admin') {
        // Not an admin - redirect to gateway
        return NextResponse.redirect(new URL('/gateway', request.url))
      }
    } catch (error) {
      // Token verification failed - redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/gateway/:path*', '/admin/:path*'],
}
