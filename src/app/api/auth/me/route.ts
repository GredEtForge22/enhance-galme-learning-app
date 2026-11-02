import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { bad, currentUser, json, readJson } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return json({ user: await currentUser() });
}

export async function PATCH(req: Request) {
  const u = await currentUser();
  if (!u) return bad("Non connecté.", 401);
  const body = await readJson<{ isPublic?: unknown }>(req);
  if (!body || typeof body.isPublic !== "boolean") return bad("Requête invalide.");
  await db.update(users).set({ isPublic: body.isPublic }).where(eq(users.id, u.id));
  return json({ user: { ...u, isPublic: body.isPublic } });
}
