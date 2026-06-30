export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/opportunities/:path*",
    "/diary/:path*",
    "/calendar/:path*",
    "/statistics/:path*",
    "/settings/:path*",
    "/api/opportunities/:path*",
    "/api/diary/:path*",
    "/api/stats/:path*",
  ],
};
