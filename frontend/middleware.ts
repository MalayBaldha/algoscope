export { default } from "next-auth/middleware";

/**
 * AlgoScope Authentication Middleware
 *
 * Intercepts requests to protected routes. If no valid session token exists,
 * the visitor is redirected to `/auth/signin` with the original URL preserved.
 */
export const config = {
  matcher: ["/dashboard/:path*", "/topics/:path*"],
};
