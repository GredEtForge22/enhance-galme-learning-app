"use client";
import { useState } from "react";
import { C } from "@/data/galme";
import { Bar, BarChart, Stat } from "@/components/ui";
import { categoryStats, counts, learnedWords, levelOf, masteredSentences, monthly, successRate, sumDays, totalAnswers, totalSecs, weekly } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { DOW, MONTHS, day, dayDate, fmtTime } from "@/lib/text";

function Calendar() {
  const { P } = useStore();
  const [off, setOff] = useState(0);
  const now = dayDate(day());
  const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + off, 1));
  const first = (m.getUTCDay() + 6) % 7;
  const nd = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
  const base = Math.floor(m.getTime() / 864e5);
  const t = day();
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < first; i++) cells.push(<div key={"e" + i} style={{ visibility: "hidden" }} />);
  for (let d = 1; d <= nd; d++) {
    const n = P.days[base + d - 1]?.a ?? 0;
    const lv = n === 0 ? "" : n < P.settings.goal / 2 ? "l1" : n < P.settings.goal ? "l2" : "l3";
    cells.push(<div key={d} className={`${lv} ${base + d - 1 === t ? "today" : ""}`} title={`${d} ${MONTHS[m.getUTCMonth()]} : ${n} réponses`} aria-label={`${d} ${MONTHS[m.getUTCMonth()]} : ${n} réponses`}>{d}</div>);
  }
  return (
    <section className="box" aria-labelledby="cal">
      <div className="row between">
        <h2 id="cal" style={{ margin: 0 }}>Calendrier d&apos;apprentissage</h2>
        <div className="row">
          <button className="chip" onClick={() => setOff(off - 1)} aria-label="Mois précédent">←</button>
          <b style={{ minWidth: 110, textAlign: "center" }}>{MONTHS[m.getUTCMonth()]} {m.getUTCFullYear()}</b>
          <button className="chip" onClick={() => setOff(Math.min(0, off + 1))} disabled={off >= 0} aria-label="Mois suivant">→</button>
        </div>
      </div>
      <div className="cal" style={{ marginTop: 10 }}>
        {DOW.map((d, i) => <div key={i} className="h">{d}</div>)}
        {cells}
      </div>
      <p className="note">Plus la case est foncée, plus tu t&apos;es rapproché de ton objectif quotidien ({P.settings.goal} réponses).</p>
    </section>
  );
}

export default function Stats() {
  const { P } = useStore();
  const [per, setPer] = useState<"week" | "month">("week");
  const cn = counts(P);
  const lv = levelOf(P.xp);
  const t = day();
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = t - 13 + i;
    return { label: String(dayDate(d).getUTCDate()), v: P.days[d]?.a ?? 0, v2: P.days[d]?.c ?? 0 };
  });
  const cats = categoryStats(P);
  const ranked = cats.filter((c) => c.a >= 1 || c.mastered > 0).sort((a, b) => b.pct - a.pct || b.acc - a.acc);
  const best = ranked.slice(0, 3), worst = [...cats].sort((a, b) => a.pct - b.pct || a.acc - b.acc).slice(0, 3);
  const rows = per === "week" ? weekly(P, 8) : monthly(P, 6);
  const types = Object.entries(P.cat).filter(([, v]) => v.a >= 3).sort((a, b) => b[1].c / b[1].a - a[1].c / a[1].a);
  const wk = sumDays(P, t - 6, t);

  return (
    <>
      <h1>Statistiques</h1>
      <p className="mu">Ta progression et tes résultats en détail.</p>
      <div className="stats four">
        <Stat v={`${successRate(P)} %`} l="taux de réussite" />
        <Stat v={fmtTime(totalSecs(P))} l="temps total" warm />
        <Stat v={learnedWords(P)} l="mots appris" />
        <Stat v={masteredSentences(P)} l="phrases maîtrisées" warm />
        <Stat v={totalAnswers(P)} l="réponses données" />
        <Stat v={P.xp} l={`XP · niveau ${lv.n}`} />
        <Stat v={wk.a} l="réponses (7 jours)" warm />
        <Stat v={P.sessions} l="séances terminées" />
      </div>

      <section className="box">
        <h2>Maîtrise du vocabulaire</h2>
        <Bar pct={(cn.mastered / C.length) * 100} kind="g" />
        <table style={{ marginTop: 8 }}>
          <tbody>
            {([["Non vus", cn.new, ""], ["Découverts", cn.seen, "seen"], ["En cours d'apprentissage", cn.learning, "learning"], ["Maîtrisés", cn.mastered, "mastered"]] as const).map(([l, n, k]) => (
              <tr key={l}><td style={{ font: "inherit" }}><span className={`dot ${k}`} />{l}</td><td><b>{n}</b> / {C.length}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="box">
        <h2>Progression · 14 derniers jours</h2>
        <BarChart data={last14} />
        <p className="note"><span className="swatch" style={{ background: "var(--ok)" }} />bonnes réponses · <span className="swatch" style={{ background: "var(--ac2)", opacity: 0.4 }} />total</p>
      </section>

      <section className="box">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Performances</h2>
          <div className="row" role="group" aria-label="Période">
            <button className={`chip ${per === "week" ? "on" : ""}`} onClick={() => setPer("week")}>Par semaine</button>
            <button className={`chip ${per === "month" ? "on" : ""}`} onClick={() => setPer("month")}>Par mois</button>
          </div>
        </div>
        <BarChart data={rows.map((r) => ({ label: r.label, v: r.a, v2: r.c }))} />
        <table>
          <thead><tr><th>{per === "week" ? "Semaine du" : "Mois"}</th><th>Réponses</th><th>Réussite</th><th>Temps</th></tr></thead>
          <tbody>
            {[...rows].reverse().map((r) => (
              <tr key={r.label}><td style={{ font: "inherit" }}>{r.label}</td><td>{r.a}</td><td>{r.a ? Math.round((r.c / r.a) * 100) + " %" : "–"}</td><td>{fmtTime(r.s)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <Calendar />

      <div className="grid" style={{ marginTop: 12 }}>
        <section className="box" style={{ marginTop: 0 }}>
          <h2>Catégories les mieux maîtrisées</h2>
          {best.length === 0 && <p className="mu">Pas encore de données.</p>}
          {best.map((c) => (<div key={c.t} style={{ marginTop: 8 }}><div className="row between"><span>{c.t}</span><b>{c.pct} %</b></div><Bar pct={c.pct} kind="g" /></div>))}
        </section>
        <section className="box" style={{ marginTop: 0 }}>
          <h2>Catégories à renforcer</h2>
          {worst.map((c) => (<div key={c.t} style={{ marginTop: 8 }}><div className="row between"><span>{c.t}</span><b>{c.pct} %</b></div><Bar pct={c.pct} /></div>))}
        </section>
      </div>

      {types.length > 0 && (
        <section className="box">
          <h2>Réussite par type de contenu</h2>
          <table><tbody>{types.map(([k, v]) => <tr key={k}><td style={{ font: "inherit" }}>{k}</td><td>{Math.round((v.c / v.a) * 100)} % <span className="mu">({v.a})</span></td></tr>)}</tbody></table>
        </section>
      )}
    </>
  );
}
