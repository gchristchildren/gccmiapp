import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keeps signed-out users out of /portal and /admin, and refreshes an expired session cookie. */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Reads the session from the cookie (refreshing it only when it has expired): no network call per click.
  // The pages themselves re-check the user and row-level security guards the data.
  const { data } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;
  const protectedPath = pathname.startsWith("/portal") || pathname.startsWith("/admin");

  if (protectedPath && !data.session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

// Only the signed-in areas need it, so public pages are served straight from the CDN.
export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
