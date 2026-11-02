import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { results, shares, users } from "@/db/schema";
import { currentUser, json } from "@/lib/server";

export const dynamic = "force-dynamic";
const CHALLENGE_TARGET = 1000;

export async function GET() {
  const me = await currentUser();
  const weekStart = sql`date_trunc('week', now())`;

  const general = await db
    .select({ pseudo: users.pseudo, summary: users.summary })
    .from(users)
    .where(eq(users.isPublic, true))
    .orderBy(desc(sql`coalesce((${users.summary}->>'xp')::int, 0)`))
    .limit(20);

  const weekRows = await db
    .select({ pseudo: users.pseudo, xp: sql<number>`coalesce(sum(${results.xp}), 0)::int`, answers: sql<number>`coalesce(sum(${results.total}), 0)::int` })
    .from(results)
    .innerJoin(users, eq(users.id, results.userId))
    .where(and(eq(users.isPublic, true), gte(results.createdAt, sql`now() - interval '7 days'`)))
    .groupBy(users.pseudo)
    .orderBy(desc(sql`sum(${results.xp})`))
    .limit(20);

  const [userCount] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  const [all] = await db.select({
    sessions: sql<number>`count(*)::int`,
    total: sql<number>`coalesce(sum(${results.total}), 0)::int`,
    correct: sql<number>`coalesce(sum(${results.correct}), 0)::int`,
  }).from(results);
  const [week] = await db.select({
    sessions: sql<number>`count(*)::int`,
    correct: sql<number>`coalesce(sum(${results.correct}), 0)::int`,
    active: sql<number>`count(distinct ${results.userId})::int`,
  }).from(results).where(gte(results.createdAt, weekStart));

  const top = await db
    .select({ pseudo: users.pseudo, best: sql<number>`max(${results.correct})::int`, total: sql<number>`max(${results.total})::int` })
    .from(results)
    .innerJoin(users, eq(users.id, results.userId))
    .where(and(eq(results.kind, "defi-semaine"), gte(results.createdAt, weekStart)))
    .groupBy(users.pseudo)
    .orderBy(desc(sql`max(${results.correct})`))
    .limit(10);

  const shared = await db
    .select({ id: shares.id, textId: shares.textId, comment: shares.comment, createdAt: shares.createdAt, pseudo: users.pseudo })
    .from(shares)
    .innerJoin(users, eq(users.id, shares.userId))
    .orderBy(desc(shares.createdAt))
    .limit(20);

  return json({
    me: me ? { pseudo: me.pseudo } : null,
    general: general.map((g) => ({ pseudo: g.pseudo, xp: g.summary.xp ?? 0, level: g.summary.level ?? 1, levelName: g.summary.levelName ?? "Curieux", mastered: g.summary.mastered ?? 0 })),
    week: weekRows,
    stats: { users: userCount.n, sessions: all.sessions, answers: all.total, rate: all.total ? Math.round((all.correct / all.total) * 100) : 0, weekSessions: week.sessions, weekActive: week.active },
    challenge: { target: CHALLENGE_TARGET, current: week.correct, top },
    shares: shared,
  });
}
