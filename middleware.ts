import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/orders/:path*",
    "/canteens/:path*",
    "/checkout/:path*",
    "/order-confirmation/:path*",
    "/student/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};
