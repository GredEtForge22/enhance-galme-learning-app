"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { textById } from "@/data/galme";
import { Bar, Stat } from "@/components/ui";

type Data = {
  me: { pseudo: string } | null;
  general: { pseudo: string; xp: number; level: number; levelName: string; mastered: number }[];
  week: { pseudo: string; xp: number; answers: number }[];
  stats: { users: number; sessions: number; answers: number; rate: number; weekSessions: number; weekActive: number };
  challenge: { target: number; current: number; top: { pseudo: string; best: number; total: number }[] };
  shares: { id: number; textId: string; comment: string; createdAt: string; pseudo: string }[];
};

export default function Communaute() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<"general" | "week">("general");
  useEffect(() => {
    fetch("/api/community", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => setErr(true));
  }, []);

  const rank = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`);
  return (
    <>
      <h1>Communauté</h1>
      <p className="mu">Classements, défi collectif de la semaine, statistiques et textes partagés.</p>
      {err && <p className="fb ko">Impossible de charger la communauté (hors ligne ?).</p>}
      {!d && !err && <p className="mu" role="status">Chargement…</p>}
      {d && (
        <>
          {!d.me && <div className="box flat"><p style={{ margin: 0 }}>Pour apparaître dans les classements et partager des textes, <Link href="/compte">connecte-toi</Link>.</p></div>}

          <section className="box" aria-labelledby="cl">
            <div className="row between">
              <h2 id="cl" style={{ margin: 0 }}>Classement</h2>
              <div className="row" role="group" aria-label="Période">
                <button className={`chip ${tab === "general" ? "on" : ""}`} onClick={() => setTab("general")}>Général</button>
                <button className={`chip ${tab === "week" ? "on" : ""}`} onClick={() => setTab("week")}>Cette semaine</button>
              </div>
            </div>
            {(tab === "general" ? d.general.length : d.week.length) === 0 && <p className="mu">Personne dans le classement pour l&apos;instant. Sois le premier !</p>}
            <table>
              <tbody>
                {tab === "general"
                  ? d.general.map((g, i) => (
                      <tr key={g.pseudo}><td style={{ font: "inherit", width: 50 }}>{rank(i)}</td><td><Link href={`/u/${g.pseudo}`}>{g.pseudo}</Link>{g.pseudo === d.me?.pseudo ? " (toi)" : ""}<div className="note">Niv. {g.level} · {g.levelName} · {g.mastered} maîtrisés</div></td><td><b>{g.xp}</b> XP</td></tr>
                    ))
                  : d.week.map((g, i) => (
                      <tr key={g.pseudo}><td style={{ font: "inherit", width: 50 }}>{rank(i)}</td><td><Link href={`/u/${g.pseudo}`}>{g.pseudo}</Link>{g.pseudo === d.me?.pseudo ? " (toi)" : ""}<div className="note">{g.answers} réponses</div></td><td><b>{g.xp}</b> XP</td></tr>
                    ))}
              </tbody>
            </table>
          </section>

          <section className="box" aria-labelledby="ch">
            <h2 id="ch">Défi communautaire de la semaine</h2>
            <p className="note">Objectif collectif : {d.challenge.target} bonnes réponses cette semaine, tous ensemble.</p>
            <div className="top"><span>{d.challenge.current} / {d.challenge.target}</span><span>{Math.min(100, Math.round((d.challenge.current / d.challenge.target) * 100))} %</span></div>
            <Bar pct={(d.challenge.current / d.challenge.target) * 100} kind="g" />
            <p className="note" style={{ marginTop: 10 }}>Les mêmes 15 questions pour tout le monde. Ton meilleur score de la semaine entre au tableau.</p>
            <Link className="btn" href="/jouer?mode=defi-semaine&back=/communaute">Relever le défi</Link>
            {d.challenge.top.length > 0 && (
              <table>
                <tbody>{d.challenge.top.map((t, i) => <tr key={t.pseudo}><td style={{ font: "inherit", width: 50 }}>{rank(i)}</td><td><Link href={`/u/${t.pseudo}`}>{t.pseudo}</Link></td><td><b>{t.best}</b>/{t.total}</td></tr>)}</tbody>
              </table>
            )}
          </section>

          <section className="box" aria-labelledby="cs">
            <h2 id="cs">Statistiques de la communauté</h2>
            <div className="stats four" style={{ marginBottom: 0 }}>
              <Stat v={d.stats.users} l="apprenants inscrits" />
              <Stat v={d.stats.answers} l="réponses données" warm />
              <Stat v={`${d.stats.rate} %`} l="taux de réussite" />
              <Stat v={d.stats.weekActive} l="actifs cette semaine" warm />
            </div>
          </section>

          <section className="box" aria-labelledby="sh">
            <h2 id="sh">Textes partagés</h2>
            {d.shares.length === 0 && <p className="mu">Aucun partage pour l&apos;instant. Partage un texte depuis la <Link href="/bibliotheque">bibliothèque</Link>.</p>}
            {d.shares.map((s) => {
              const t = textById(s.textId);
              return (
                <div key={s.id} style={{ borderTop: "1px solid var(--bd)", padding: "10px 0" }}>
                  <b>{t ? <Link href={`/bibliotheque/${t.id}`}>{t.title}</Link> : s.textId}</b>
                  <span className="note"> · par <Link href={`/u/${s.pseudo}`}>{s.pseudo}</Link> · {new Date(s.createdAt).toLocaleDateString("fr-FR")}</span>
                  {s.comment && <p style={{ margin: "4px 0 0" }}>{s.comment}</p>}
                </div>
              );
            })}
          </section>
        </>
      )}
    </>
  );
}
