import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth") || pathname === "/login") {
    return authRes;
  }

  const session = await auth0.getSession(request);
  if (session) return authRes;

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
