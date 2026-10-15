import { cookies } from "next/headers";
import { SESSION_COOKIE, isSessionValid } from "@/lib/auth";

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isSessionValid(store.get(SESSION_COOKIE)?.value);
}
