import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isSessionValid } from "@/lib/auth";

// Endpoints that always require a session, whatever the method.
const ALWAYS_PROTECTED = ["/api/stats", "/api/seed"];

// Collection reads are newsroom-only; readers may still POST (signup / tip line).
const READ_PROTECTED = ["/api/subscribers", "/api/tips"];

// Collection writes (create / update / delete) always require a session.
const WRITE_PROTECTED = ["/api/breaking", "/api/categories"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }
  if (pathname === "/api/health" || pathname.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
  const isValid = await isSessionValid(request.cookies.get(SESSION_COOKIE)?.value);

  const deny = () => {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  };

  const allow = () => NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return isValid ? allow() : deny();
  }

  if (!isApi) return allow();

  if (matchesPrefix(pathname, ALWAYS_PROTECTED)) {
    return isValid ? allow() : deny();
  }

  if (matchesPrefix(pathname, READ_PROTECTED)) {
    if (method === "GET" || method === "HEAD") {
      return isValid ? allow() : deny();
    }
    return allow();
  }

  if (matchesPrefix(pathname, WRITE_PROTECTED)) {
    if (method === "GET" || method === "HEAD") return allow();
    return isValid ? allow() : deny();
  }

  // Reader reactions are public; story creation and edits are not.
  if (pathname.endsWith("/react")) {
    return method === "POST" ? allow() : deny();
  }

  if (pathname === "/api/articles" || pathname.startsWith("/api/articles/")) {
    const wantsDrafts = request.nextUrl.searchParams.get("includeDrafts") === "true";
    if (method === "GET" && !wantsDrafts) return allow();
    return isValid ? allow() : deny();
  }

  // Reader comments: public posting + public thread (approved only),
  // moderation reads/deletes are newsroom-only.
  if (pathname === "/api/comments" || pathname.startsWith("/api/comments/")) {
    if (method === "POST") return allow();
    if (method === "GET" && request.nextUrl.searchParams.get("articleId")) return allow();
    return isValid ? allow() : deny();
  }

  // Public reader poll: one vote per request, validated and rate-limited in the route.
  if (pathname === "/api/poll" || pathname.startsWith("/api/poll/")) {
    return allow();
  }

  return allow();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
