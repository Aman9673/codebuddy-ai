export const sessionCookie = "codebuddy_session";

export type AccountProfile = { name: string; email: string };

export async function getSessionProfile(token?: string): Promise<AccountProfile | null> {
  if (!token || !/^[\w-]{43}$/.test(token)) return null;

  try {
    const api = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    const response = await fetch(`${api}/api/auth/me`, {
      headers: { Cookie: `${sessionCookie}=${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
