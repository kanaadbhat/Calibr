import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"

const roleRoutes: Record<string, string[]> = {
  employer: ["/dashboard/employer", "/profile/employer"],
  candidate: ["/dashboard/candidate", "/profile/candidate"],
}
export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // If no token → allow only public routes
    if (!token) {
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = token.role as string

    // If logged in and visiting login/signup → redirect to dashboard
    if (pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
    }

    // Role-based protected routes
    const allowedRoutes = [ `/dashboard/${userRole}`, `/profile/${userRole}` ]
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route))

    if (!isAllowed && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
    }
    if (!isAllowed && pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL(`/profile/${userRole}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Public routes don't need auth
        if (pathname === "/login" || pathname === "/signup") return true
        // Everything else requires a token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/applications/:path*",
    "/settings/:path*",
  ],
}

