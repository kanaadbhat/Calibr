// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  ({ nextUrl, nextauth }) => {
    const role = nextauth?.token?.role
    if (!role) return

    for (const r of ["/dashboard", "/profile"]) {
      if (nextUrl.pathname.startsWith(r) && !nextUrl.pathname.startsWith(`${r}/${role}`)) {
        return NextResponse.redirect(new URL(`${r}/${role}`, nextUrl))
      }
    }
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = { matcher: ["/dashboard/:path*", "/profile/:path*"] }