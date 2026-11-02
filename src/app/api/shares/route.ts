import { textById } from "@/data/galme";
import { db } from "@/db";
import { shares } from "@/db/schema";
import { bad, currentUser, json, limited, readJson } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return bad("Connecte-toi pour partager un texte.", 401);
  if (limited("share:" + u.id, 10, 60 * 60 * 1000)) return bad("Trop de partages, réessaie plus tard.", 429);
  const b = await readJson<{ textId?: unknown; comment?: unknown }>(req);
  if (!b || typeof b.textId !== "string" || !textById(b.textId)) return bad("Texte inconnu.");
  const comment = typeof b.comment === "string" ? b.comment.trim().slice(0, 200) : "";
  await db.insert(shares).values({ userId: u.id, textId: b.textId, comment });
  return json({ ok: true });
}
