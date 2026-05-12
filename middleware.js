import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "your-secret-key"
);

// Public routes that don't need authentication
const publicRoutes = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/products",
  "/api/tracking",
];

// Admin routes that require authentication
const adminRoutes = ["/api/admin/", "/admin/"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check admin routes for authentication
  if (isAdminRoute) {
    try {
      const token = request.cookies.get("authToken")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized - No token provided" },
          { status: 401 }
        );
      }

      const verified = await jwtVerify(token, JWT_SECRET);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user", JSON.stringify(verified.payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};