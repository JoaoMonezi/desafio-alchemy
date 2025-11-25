import NextAuth from "next-auth";
import authConfig from "@/Config/auth.config"; // Import the config (default export)
import { NextResponse } from "next/server";

// Initialize NextAuth with the Edge-safe config to get the auth helper
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/app");
  const isOnAuthRoute = req.nextUrl.pathname.startsWith("/auth");

  // If logged in and accessing login/register, redirect to dashboard
  if (isLoggedIn && isOnAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.nextUrl));
  }

  // If NOT logged in and accessing protected routes, redirect to login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};