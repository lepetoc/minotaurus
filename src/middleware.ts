import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const isAuthenticated = !!req.nextauth.token

    if (req.nextUrl.pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    pages: {
      signIn: '/login',
      error: '/error',
    },
  }
)

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
