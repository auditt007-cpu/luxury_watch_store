import { cookies } from "next/headers";

const COOKIE = "admin_session";

export const ADMIN_COOKIE = COOKIE;

export function sessionToken() {
  return process.env.AUTH_SECRET || "please-change-this-secret";
}

export function isValidToken(token?: string | null) {
  return Boolean(token) && token === sessionToken();
}

export function checkPassword(password: string) {
  return password === (process.env.ADMIN_PASSWORD || "luxury2026");
}

export function isAdmin() {
  return isValidToken(cookies().get(COOKIE)?.value);
}
