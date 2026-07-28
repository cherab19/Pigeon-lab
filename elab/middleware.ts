export { auth as middleware } from "@/lib/auth";
export const config = { matcher: ["/dashboard/:path*", "/manage-users/:path*", "/lab/:path*", "/textbooks/:path*", "/subscribe/:path*", "/success-guide/:path*"] };
