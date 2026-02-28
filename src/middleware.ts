import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  
  // Public routes that don't require authentication
  const isPublicRoute = 
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/favicon.ico"
  
  // If not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  
  // If logged in and on login page, redirect to home
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
}
