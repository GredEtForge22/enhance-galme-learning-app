import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const COOKIE = "galme_session";
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const bad = (msg: string, status = 400) => json({ error: msg }, status);

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}
export function checkPassword(password: string, salt: string, hash: string) {
  const a = Buffer.from(scryptSync(password, salt, 64).toString("hex"));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const maxAge = 60 * 60 * 24 * 30;
  await db.insert(sessions).values({ token, userId, expiresAt: new Date(Date.now() + maxAge * 1000) });
  const h = await headers();
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: h.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge,
  });
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, isPublic: users.isPublic })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

const hits = new Map<string, number[]>();
/** Limiteur simple en mémoire : max `n` tentatives par fenêtre. */
export function limited(key: string, n = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > n;
}

export async function clientKey() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "local").split(",")[0].trim();
}

export async function readJson<T = Record<string, unknown>>(req: Request, maxChars = 20000): Promise<T | null> {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return null;
  try {
    const text = await req.text();
    if (text.length > maxChars) return null;
    const v = JSON.parse(text);
    return typeof v === "object" && v !== null ? (v as T) : null;
  } catch {
    return null;
  }
}
