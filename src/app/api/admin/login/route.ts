import { NextResponse } from "next/server";
import { checkPassword, ADMIN_COOKIE, sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!checkPassword(String(body.password || ""))) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
