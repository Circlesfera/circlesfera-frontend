import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/feed', '/explore', '/upload', '/notifications', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Middleware de protección de rutas. Redirige a la landing cuando el usuario no
 * posee sesión y evita que usuarios autenticados visiten la pantalla de login.
 */
export function middleware(request: NextRequest): NextResponse {
  // El backend establece la cookie 'circlesfera_refresh' después del login
  const refreshCookie = request.cookies.get('circlesfera_refresh');

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!refreshCookie && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
  if (refreshCookie && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/feed';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\..*).*)']
};

