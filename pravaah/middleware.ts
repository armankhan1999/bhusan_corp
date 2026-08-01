import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession } from "./lib/rbac/session";
import { can, capabilityForPath, LANDING_ROUTE } from "./lib/rbac/matrix";

/**
 * RBAC-1 layer 2 — the route guard. A user who guesses a URL is denied here,
 * server-side, not merely hidden from the navigation. The denial is carried to
 * the denied page so it can be written to the audit log (RBAC-6).
 *
 * Runs on the Edge runtime in production, which is stricter than the Node
 * sandbox `next start` uses locally. Two consequences shape this file:
 *
 *   1. Everything it imports must be Edge-safe. `lib/rbac/matrix` and
 *      `lib/rbac/session` are pure data and pure functions, and their only
 *      reference to `lib/schemas/enums` is `import type`, so zod never enters
 *      the Edge bundle. Do not add a value import from the schema layer here.
 *   2. A throw in middleware fails the whole request with
 *      MIDDLEWARE_INVOCATION_FAILED — a blank 500 on every route, including the
 *      login page. So the body is wrapped: an unexpected fault degrades to
 *      "unauthenticated" rather than taking the site down, and reports itself
 *      through a response header instead of a stack trace the user cannot see.
 */

/** Asset-ish paths never need a guard, and shouldn't pay for one. */
const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|txt|xml|json|webmanifest|woff2?|ttf|otf|eot|css|js|map)$/i;

const OPEN_PATHS = ["/login", "/denied"];

function isOpen(pathname: string): boolean {
  return (
    OPEN_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/session") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isOpen(pathname)) return NextResponse.next();

  try {
    const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value);

    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      // E1-S1 — the requested path is retained for post-login return.
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }

    if (pathname === "/") {
      const landing = LANDING_ROUTE[session.role] ?? "/login";
      const qIndex = landing.indexOf("?");
      const url = req.nextUrl.clone();
      url.pathname = qIndex === -1 ? landing : landing.slice(0, qIndex);
      url.search = qIndex === -1 ? "" : landing.slice(qIndex);
      return NextResponse.redirect(url);
    }

    const cap = capabilityForPath(pathname);
    if (cap && !can(session.role, cap)) {
      const url = req.nextUrl.clone();
      url.pathname = "/denied";
      url.search = "";
      url.searchParams.set("path", pathname);
      url.searchParams.set("cap", cap);
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  } catch (err) {
    // Fail closed on identity, but never fail the request itself.
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    res.headers.set(
      "x-pravaah-guard-error",
      (err instanceof Error ? err.message : String(err)).slice(0, 180),
    );
    return res;
  }
}

/**
 * There is deliberately no `export const config` here.
 *
 * Vercel extracts a middleware's static config by parsing this file with the
 * TypeScript compiler API and walking the exported object literal. That walk
 * failed the deploy with `Error: Unhandled type: "ColonToken"` — the name of
 * the `:` node in `ts.SyntaxKind` — after a clean build of all 80 routes. No
 * matcher expression avoided it, because the problem is the object literal
 * being parsed at all, not the pattern inside it.
 *
 * Without a matcher, middleware runs on every request. That is why `isOpen()`
 * exists above: it returns on the first comparison for `_next`, API and asset
 * paths, so the cost is one function invocation and the guard cannot be broken
 * by a build-time parser.
 */
