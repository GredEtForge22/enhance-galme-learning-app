import { db } from "@/db";
import { users } from "@/db/schema";
import { bad, clientKey, createSession, hashPassword, json, limited, readJson } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited("reg:" + (await clientKey()), 8)) return bad("Trop de tentatives, réessaie plus tard.", 429);
  const body = await readJson<{ pseudo?: unknown; password?: unknown }>(req);
  if (!body) return bad("Requête invalide.");
  const pseudo = typeof body.pseudo === "string" ? body.pseudo.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(pseudo)) return bad("Pseudo : 3 à 20 caractères (lettres, chiffres, - et _).");
  if (password.length < 8 || password.length > 100) return bad("Mot de passe : 8 caractères minimum.");
  const { salt, hash } = hashPassword(password);
  try {
    const [u] = await db.insert(users).values({ pseudo, pseudoKey: pseudo.toLowerCase(), passwordHash: hash, salt }).returning({ id: users.id, pseudo: users.pseudo, isPublic: users.isPublic });
    await createSession(u.id);
    return json({ user: u });
  } catch {
    return bad("Ce pseudo est déjà pris.", 409);
  }
}
