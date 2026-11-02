import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { results } from "@/db/schema";
import { bad, currentUser, json, limited, readJson } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u) return bad("Non connecté.", 401);
  const rows = await db
    .select({ kind: results.kind, correct: results.correct, total: results.total, xp: results.xp, createdAt: results.createdAt })
    .from(results)
    .where(eq(results.userId, u.id))
    .orderBy(desc(results.createdAt))
    .limit(30);
  return json({ results: rows });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return bad("Non connecté.", 401);
  if (limited("res:" + u.id, 120, 10 * 60 * 1000)) return bad("Trop de requêtes.", 429);
  const b = await readJson<{ kind?: unknown; correct?: unknown; total?: unknown; xp?: unknown }>(req);
  if (!b) return bad("Requête invalide.");
  const kind = typeof b.kind === "string" && /^[a-z0-9-]{1,30}$/.test(b.kind) ? b.kind : null;
  const total = typeof b.total === "number" ? Math.round(b.total) : -1;
  const correct = typeof b.correct === "number" ? Math.round(b.correct) : -1;
  const xp = typeof b.xp === "number" ? Math.round(b.xp) : 0;
  if (!kind || total < 1 || total > 500 || correct < 0 || correct > total) return bad("Résultat invalide.");
  await db.insert(results).values({ userId: u.id, kind, correct, total, xp: Math.min(Math.max(xp, 0), total * 12 + 300) });
  return json({ ok: true });
}
