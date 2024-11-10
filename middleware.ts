import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',  // Only the root path is public
  '/api/webhooks(.*)', // Webhook routes if needed
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    // This protects all routes except those defined in isPublicRoute
    const { userId } = auth();
    if (!userId) {
      // If the user is not authenticated, redirect to the sign-in page
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  // For public routes or authenticated users on protected routes, continue the request
  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}