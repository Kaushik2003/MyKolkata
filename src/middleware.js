import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/login', '/signup', '/brand-kit'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL('/login', req.url).toString() })
  }
})

export const config = {
  // Skip Next internals, static files, and /api/*. The list endpoints serve
  // public catalogue data and are CDN-cached, so running auth middleware on
  // them only added latency to every request without protecting anything.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
