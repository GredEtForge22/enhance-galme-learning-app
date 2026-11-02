"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { C, NOTES, U, analyze, examplesOf, formsOf, lessonOfWord, tokens, AFF_LABEL } from "@/data/galme";
import { Sentence, StatusTag } from "@/components/ui";
import { STATUS_LABEL, statusOf } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { norm } from "@/lib/text";

const order = [...C].sort((a, b) => norm(a.g).localeCompare(norm(b.g)));

export default function Fiche() {
  const { id } = useParams<{ id: string }>();
  const e = /^\d+$/.test(id) ? C[+id] : undefined;
  const { P, update } = useStore();

  useEffect(() => {
    if (!e) return;
    if (P.recent[0] !== e.id) update((p) => { p.recent = [e.id, ...p.recent.filter((x) => x !== e.id)].slice(0, 10); });
    if (window.location.hash === "#exemples") setTimeout(() => document.getElementById("exemples")?.scrollIntoView(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e?.id]);

  const ex = useMemo(() => (e ? examplesOf(e) : []), [e]);
  const forms = useMemo(() => (e ? formsOf(e) : []), [e]);
  if (!e) return <div className="box"><h2>Entrée introuvable</h2><Link className="btn" href="/dictionnaire">Retour au dictionnaire</Link></div>;

  const card = P.cards[e.id];
  const s = statusOf(P, e.id);
  const fav = P.fav.words.includes(e.id);
  const l = lessonOfWord(e.id);
  const i = order.findIndex((x) => x.id === e.id);
  const prev = order[i - 1], next = order[i + 1];
  const here = encodeURIComponent(`/dictionnaire/${e.id}`);

  return (
    <>
      <p className="note"><Link href="/dictionnaire">← Dictionnaire</Link></p>
      <section className="box" aria-labelledby="mot">
        <div className="row between">
          <span className="tag">{e.t}</span>
          <button className="chip" aria-pressed={fav} onClick={() => update((p) => { p.fav.words = fav ? p.fav.words.filter((x) => x !== e.id) : [...p.fav.words, e.id]; })}>{fav ? "★ Favori" : "☆ Ajouter aux favoris"}</button>
        </div>
        <h1 id="mot" className="big" style={{ margin: "14px 0 4px" }}>{e.g}</h1>
        <p className="lab" style={{ fontSize: 22, color: "var(--tx)" }}>{e.f}</p>
        <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
          <StatusTag s={s} />
          <span className="note" aria-label={`Niveau de maîtrise ${card?.b ?? 0} sur 5`}>{"●".repeat(card?.b ?? 0)}{"○".repeat(5 - (card?.b ?? 0))}</span>
        </div>
        <p className="lab" style={{ marginTop: 6 }}>
          {card ? `${card.ok} bonne${card.ok > 1 ? "s" : ""} réponse${card.ok > 1 ? "s" : ""} · ${card.ko} erreur${card.ko > 1 ? "s" : ""}` : STATUS_LABEL.new}
        </p>
        <Link className="btn" href={`/jouer?mode=mot&id=${e.id}&back=${here}`}>Réviser ce mot</Link>
      </section>

      <section className="box">
        <h2>Informations</h2>
        <table>
          <tbody>
            <tr><td style={{ font: "inherit", fontWeight: 700 }}>Catégorie</td><td>{e.t}</td></tr>
            <tr><td style={{ font: "inherit", fontWeight: 700 }}>Traduction</td><td>{e.f}</td></tr>
            <tr><td style={{ font: "inherit", fontWeight: 700 }}>Thème</td><td>{U[e.u]}</td></tr>
            {l && <tr><td style={{ font: "inherit", fontWeight: 700 }}>Leçon</td><td><Link href={`/apprendre/${l.id}`}>{l.title}</Link></td></tr>}
            {forms.length > 0 && <tr><td style={{ font: "inherit", fontWeight: 700 }}>Formes répertoriées</td><td>{forms.join(" · ")}</td></tr>}
          </tbody>
        </table>
        <details><summary>Règle du thème</summary><p className="note" dangerouslySetInnerHTML={{ __html: NOTES[e.u] }} /></details>
      </section>

      {e.u === 5 && (
        <section className="box">
          <h2>Mot à mot</h2>
          <Sentence g={e.g} />
          <table>
            <tbody>
              {tokens(e.g).filter((t) => t !== "?").map((t, k) => {
                const a = analyze(t);
                return (
                  <tr key={k}>
                    <td>{t.replace(/[,?]+$/, "")}</td>
                    <td>
                      {a.aff.map((x) => `${x} (${AFF_LABEL[x]})`).join(" + ")}{a.aff.length ? " + " : ""}
                      {a.entry ? <Link href={`/dictionnaire/${a.entry.id}`}>{a.entry.g} = {a.entry.f}</Link> : <span className="mu">absent du dictionnaire</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {e.u < 5 && (
        <section className="box" id="exemples" aria-labelledby="exh">
          <h2 id="exh">Exemples du corpus ({ex.length})</h2>
          {ex.length === 0 && <p className="mu">Aucune phrase du corpus n&apos;utilise ce mot pour le moment.</p>}
          {ex.map((s2) => (
            <div key={s2.id} style={{ borderTop: "1px solid var(--bd)", padding: "10px 0" }}>
              <Sentence g={s2.g} f={s2.f} />
              <Link href={`/dictionnaire/${s2.id}`} className="note">Fiche de la phrase</Link>
            </div>
          ))}
        </section>
      )}

      <div className="row between" style={{ marginTop: 14 }}>
        {prev ? <Link className="btn sm alt" href={`/dictionnaire/${prev.id}`}>← {prev.g}</Link> : <span />}
        {next ? <Link className="btn sm alt" href={`/dictionnaire/${next.id}`}>{next.g} →</Link> : <span />}
      </div>
    </>
  );
}
