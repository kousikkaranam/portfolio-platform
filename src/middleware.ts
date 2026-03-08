import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN; // e.g. "kousikkaranam.is-a.dev"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.replace(/:\d+$/, "") ?? "";
  const { pathname } = request.nextUrl;

  // Skip for API routes, admin, login, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If this is the primary domain or localhost, let normal routing handle it
  if (
    !PRIMARY_DOMAIN ||
    hostname === PRIMARY_DOMAIN ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return NextResponse.next();
  }

  // Custom domain detected — look up the user by domain
  // We call an internal API to avoid importing Prisma in edge middleware
  const lookupUrl = new URL("/api/domain-lookup", request.url);
  lookupUrl.searchParams.set("domain", hostname);

  try {
    const res = await fetch(lookupUrl.toString());
    if (res.ok) {
      const { slug } = await res.json();
      if (slug) {
        // Rewrite "/" to "/<slug>" internally (URL stays the same for the user)
        if (pathname === "/") {
          const url = request.nextUrl.clone();
          url.pathname = `/${slug}`;
          return NextResponse.rewrite(url);
        }
        // For sub-paths like /blog/post-slug, prepend the user slug
        if (!pathname.startsWith(`/${slug}`)) {
          const url = request.nextUrl.clone();
          url.pathname = `/${slug}${pathname}`;
          return NextResponse.rewrite(url);
        }
      }
    }
  } catch {
    // If lookup fails, fall through to normal routing
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
