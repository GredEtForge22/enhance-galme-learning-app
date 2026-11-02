import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { BADGES } from "@/lib/gamification";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil public" };

export default async function PublicProfile({ params }: { params: Promise<{ pseudo: string }> }) {
  const { pseudo } = await params;
  const key = decodeURIComponent(pseudo).toLowerCase();
  const [u] = /^[a-z0-9_-]{3,20}$/.test(key) ? await db.select().from(users).where(eq(users.pseudoKey, key)).limit(1) : [];
  if (!u || !u.isPublic) {
    return (
      <div className="box">
        <h1>Profil introuvable</h1>
        <p className="mu">Ce profil n&apos;existe pas ou n&apos;est pas public.</p>
        <Link className="btn" href="/communaute">Retour à la communauté</Link>
      </div>
    );
  }
  const s = u.summary;
  const badges = BADGES.filter((b) => (s.badges ?? []).includes(b.id));
  return (
    <>
      <p className="note"><Link href="/communaute">← Communauté</Link></p>
      <section className="box">
        <div className="row" style={{ flexWrap: "nowrap", gap: 14 }}>
          <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ac)", color: "var(--on)", display: "flex", alignItems: "center", justifyContent: "center", font: "400 30px var(--serif)", flex: "none" }}>{u.pseudo.charAt(0).toUpperCase()}</div>
          <div>
            <h1 style={{ margin: 0 }}>{u.pseudo}</h1>
            <p className="mu" style={{ margin: 0 }}>Niveau {s.level ?? 1} · {s.levelName ?? "Curieux"} · inscrit le {u.createdAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </section>
      <div className="stats four">
        <div className="st warm"><b>{s.xp ?? 0}</b>XP</div>
        <div className="st"><b>{s.mastered ?? 0}</b>entrées maîtrisées</div>
        <div className="st warm"><b>{s.bestStreak ?? 0}</b>meilleure série</div>
        <div className="st"><b>{s.lessons ?? 0}</b>leçons terminées</div>
      </div>
      <section className="box">
        <h2>Badges ({badges.length})</h2>
        {badges.length === 0 && <p className="mu">Aucun badge pour l&apos;instant.</p>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {badges.map((b) => (
            <div key={b.id} className="bdg"><span className="ic" aria-hidden="true">{b.icon}</span><b>{b.name}</b></div>
          ))}
        </div>
      </section>
    </>
  );
}
