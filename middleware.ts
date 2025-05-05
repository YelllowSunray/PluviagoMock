import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyIdToken } from './src/lib/firebase-admin';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')[1];

  // If there's no token, return 401
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify the token
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add the user info to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decodedToken.uid);
    requestHeaders.set('x-user-email', decodedToken.email || '');

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    '/api/:path*', // Protect all API routes
    '/batch/:path*', // Protect batch processing routes
  ],
}; 