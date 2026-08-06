import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always use getUser() for server-side auth validation (not getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/connexion', '/inscription', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Auth routes (redirect if already logged in)
  const authRoutes = ['/connexion', '/inscription'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  // Activation route
  const isActivationRoute = pathname === '/activation';

  // Static / API routes — skip
  const isStaticOrApi =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.');

  if (isStaticOrApi) {
    return supabaseResponse;
  }

  // --- Unauthenticated users ---
  if (!user) {
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/connexion';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // --- Authenticated users ---

  // Redirect logged-in users away from auth routes
  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/accueil';
    return NextResponse.redirect(url);
  }

  // Check role for admin routes
  if (isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/accueil';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // --- Activation gate for students ---
  // Check if student has any active package
  if (!isActivationRoute && !isAdminRoute && pathname !== '/profil') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Only apply activation gate to students, not admins
    if (profile?.role === 'student') {
      const { data: activations } = await supabase
        .from('student_activations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (!activations || activations.length === 0) {
        const url = request.nextUrl.clone();
        url.pathname = '/activation';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
