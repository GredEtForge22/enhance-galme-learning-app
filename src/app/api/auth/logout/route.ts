import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { COOKIE, json } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) await db.delete(sessions).where(eq(sessions.token, token));
  jar.delete(COOKIE);
  return json({ ok: true });
}
