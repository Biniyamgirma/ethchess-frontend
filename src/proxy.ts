import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasAdminSession = Boolean(
    request.cookies.get("ethchess_admin")?.value,
  );
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isMemberLogin = request.nextUrl.pathname === "/member/login";
  const isMemberRegister = request.nextUrl.pathname === "/member/register";
  const isMemberAuthPage = isMemberLogin || isMemberRegister;
  const isMemberApp =
    request.nextUrl.pathname === "/member" ||
    request.nextUrl.pathname.startsWith("/member/");
  const isPublicMemberRoute =
    request.nextUrl.pathname === "/member/venues" ||
    request.nextUrl.pathname.startsWith("/member/venues/");
  const hasMemberSession = Boolean(
    request.cookies.get("ethchess_member")?.value,
  );
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    [
      "/members",
      "/venue-owners",
      "/venues",
      "/events",
      "/bookings",
      "/settings",
    ].some(
      (path) =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith(`${path}/`),
    );

  if (isProtectedRoute && !hasAdminSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isMemberApp &&
    !isMemberAuthPage &&
    !isPublicMemberRoute &&
    !hasMemberSession
  ) {
    const loginUrl = new URL("/member/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isMemberAuthPage && hasMemberSession) {
    return NextResponse.redirect(new URL("/member/home", request.url));
  }

  if (isLoginPage && hasAdminSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
