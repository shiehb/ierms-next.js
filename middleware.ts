import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "./lib/supabase/types"

// Define protected and public routes
const protectedRoutes = ["/dashboard", "/users", "/force-password-change", "/profile"]
const publicRoutes = ["/login", "/signup", "/admin-setup", "/forgot-password", "/verify-reset", "/reset-password"]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

  // Create a response object to pass to supabase
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Create Supabase client for middleware
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Check for auth session cookie (our custom session management)
  const authSession = req.cookies.get("auth_session")
  const isAuthenticated = !!authSession?.value

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Redirect authenticated users from public routes to dashboard
  if (isPublicRoute && isAuthenticated && !path.startsWith("/force-password-change")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
}
