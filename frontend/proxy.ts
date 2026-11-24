import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile, sessionCookie } from "./app/lib/session";

export async function proxy(request: NextRequest) {
  const authPage = ["/login", "/signup"].includes(request.nextUrl.pathname);
  const signedIn = Boolean(await getSessionProfile(request.cookies.get(sessionCookie)?.value));

  const response = authPage === signedIn
    ? NextResponse.redirect(new URL(signedIn ? "/" : "/login", request.url))
    : NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/login", "/signup", "/lessons/:path*", "/quizzes/:path*",
    "/playground/:path*", "/ai-tutor/:path*", "/notes/:path*", "/about/:path*",
  ],
};
