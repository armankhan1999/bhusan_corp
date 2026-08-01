import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession } from "./lib/rbac/session";
import { can, capabilityForPath, LANDING_ROUTE } from "./lib/rbac/matrix";

/**
 * RBAC-1 layer 2 — the route guard. A user who guesses a URL is denied here,
 * server-side, not merely hidden from the navigation. The denial is carried to
 * the denied page so it can be written to the audit log (RBAC-6).
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (
    pathname.startsWith("/_next") || pathname.startsWith("/api/session") ||
    pathname === "/login" || pathname.startsWith("/favicon") || pathname === "/denied"
  ) {
    return NextResponse.next();
  }

  const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // E1-S1 — the requested path is retained for post-login return.
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    const landing = LANDING_ROUTE[session.role];
    const [p, q] = landing.split("?");
    url.pathname = p!;
    url.search = q ? `?${q}` : "";
    return NextResponse.redirect(url);
  }

  const cap = capabilityForPath(pathname);
  if (cap && !can(session.role, cap)) {
    const url = req.nextUrl.clone();
    url.pathname = "/denied";
    url.search = `?path=${encodeURIComponent(pathname)}&cap=${cap}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
