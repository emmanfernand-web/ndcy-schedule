// NOTE: In Next.js 16, `middleware.ts` has been renamed to `proxy.ts`.
// The function export is also renamed from `middleware` to `proxy`.
// This file protects /admin routes, redirecting unauthenticated users to /admin/login.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for keeping the auth cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect all /admin routes except /admin/login
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in, redirect away from login page
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/matrix', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match only /admin routes, skipping static assets.
     */
    '/admin/:path*',
  ],
};
