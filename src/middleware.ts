import { baseUrl } from "@/lib/baseUrl";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { url, nextUrl, cookies } = request;
  const token = cookies.get("accessToken")?.value;

  const ftch = () =>
    fetch(`${baseUrl}/checkLogin`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

  const res = await ftch();

  event.waitUntil(ftch());

  if (res.ok) {
    console.log("data true");
    if (nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard/storage-report", url));
    }
    return NextResponse.next();
  } else if (!res.ok) {
    console.log("data false");
    if (!nextUrl.pathname.startsWith("/login")) {
      const response = NextResponse.redirect(new URL("/login", url));
      response.cookies.delete("profile");
      response.cookies.delete("accessToken");
      return response;
    }

    const response = NextResponse.next();
    response.cookies.delete("profile");
    response.cookies.delete("accessToken");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
