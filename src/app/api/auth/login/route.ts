import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { bad, checkPassword, clientKey, createSession, json, limited, readJson } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson<{ pseudo?: unknown; password?: unknown }>(req);
  if (!body) return bad("Requête invalide.");
  const pseudo = typeof body.pseudo === "string" ? body.pseudo.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (limited("login:" + (await clientKey()) + ":" + pseudo, 10)) return bad("Trop de tentatives, réessaie plus tard.", 429);
  if (!pseudo || !password || password.length > 100) return bad("Identifiants invalides.", 401);
  const [u] = await db.select().from(users).where(eq(users.pseudoKey, pseudo)).limit(1);
  if (!u || !checkPassword(password, u.salt, u.passwordHash)) return bad("Identifiants invalides.", 401);
  await createSession(u.id);
  return json({ user: { id: u.id, pseudo: u.pseudo, isPublic: u.isPublic } });
}
