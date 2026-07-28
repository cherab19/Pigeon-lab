import { NextRequest, NextResponse } from "next/server";

// Middleware always runs in the Edge runtime. Keep it independent from Prisma
// and password hashing; every API mutation and server helper still validates
// the signed Auth.js session again before reading or changing data.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/manage-users/:path*", "/lab/:path*", "/textbooks/:path*", "/subscribe/:path*", "/success-guide/:path*"] };
