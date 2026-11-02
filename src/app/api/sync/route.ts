import { eq } from "drizzle-orm";
import { db } from "@/db";
import { progress, users } from "@/db/schema";
import { summaryOf } from "@/lib/gamification";
import { sanitize } from "@/lib/progress";
import { bad, currentUser, json, limited, readJson } from "@/lib/server";
import { levelOf, streak } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u) return bad("Non connecté.", 401);
  const [row] = await db.select().from(progress).where(eq(progress.userId, u.id)).limit(1);
  return json({ data: row?.data ?? null, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!u) return bad("Non connecté.", 401);
  if (limited("sync:" + u.id, 60, 10 * 60 * 1000)) return bad("Trop de synchronisations.", 429);
  const body = await readJson<{ data?: unknown }>(req, 600_000);
  const p = body ? sanitize(body.data) : null;
  if (!p) return bad("Données invalides.");
  const summary = summaryOf(p, streak(p), levelOf(p.xp));
  await db
    .insert(progress)
    .values({ userId: u.id, data: p as unknown as Record<string, unknown> })
    .onConflictDoUpdate({ target: progress.userId, set: { data: p as unknown as Record<string, unknown>, updatedAt: new Date() } });
  await db.update(users).set({ summary }).where(eq(users.id, u.id));
  return json({ ok: true });
}
