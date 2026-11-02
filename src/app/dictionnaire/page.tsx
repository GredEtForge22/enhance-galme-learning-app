"use client";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { C, TO, TT, examplesOf } from "@/data/galme";
import { statusOf } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { norm } from "@/lib/text";

type Filter = "all" | "mastered" | "notmastered" | "fav";
const FILTERS: [Filter, string][] = [["all", "Tous"], ["mastered", "Maîtrisés"], ["notmastered", "Non maîtrisés"], ["fav", "Favoris ★"]];

function Hl({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export default function Dico() {
  const { P, update } = useStore();
  const [q, setQ] = useState("");
  const [tp, setTp] = useState("");
  const [flt, setFlt] = useState<Filter>("all");
  const v = norm(q);

  // Historique des recherches : enregistré quand la saisie se stabilise
  useEffect(() => {
    const s = q.trim();
    if (s.length < 2) return;
    const t = setTimeout(() => update((p) => { p.searches = [s, ...p.searches.filter((x) => x !== s)].slice(0, 10); }), 1500);
    return () => clearTimeout(t);
  }, [q, update]);

  const list = useMemo(() => {
    const score = (g: string, f: string) => {
      const ng = norm(g), nf = norm(f);
      return ng === v ? 0 : ng.startsWith(v) ? 1 : ng.includes(v) ? 2 : nf.startsWith(v) ? 3 : nf.includes(v) ? 4 : 9;
    };
    return C.filter((c) => (!tp || c.t === tp) && (!v || score(c.g, c.f) < 9))
      .filter((c) => {
        const m = P.cards[c.id]?.b >= 4;
        return flt === "all" || (flt === "mastered" && m) || (flt === "notmastered" && !m) || (flt === "fav" && P.fav.words.includes(c.id));
      })
      .sort((a, b) => (v ? score(a.g, a.f) - score(b.g, b.f) : 0) || norm(a.g).localeCompare(norm(b.g)));
  }, [v, tp, flt, P.cards, P.fav.words]);

  const fav = (id: number) =>
    update((p) => { p.fav.words = p.fav.words.includes(id) ? p.fav.words.filter((x) => x !== id) : [...p.fav.words, id]; });
  const groups = TO.filter((t) => list.some((c) => c.t === t));
  const flat = !!v;

  const row = (c: (typeof C)[number]) => {
    const ex = c.u < 5 ? examplesOf(c).length : 0;
    const s = statusOf(P, c.id);
    const isFav = P.fav.words.includes(c.id);
    return (
      <tr key={c.id}>
        <td><Link href={`/dictionnaire/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}><Hl text={c.g} q={q.trim()} /></Link></td>
        <td>
          <span className={`dot ${s === "new" ? "" : s}`} title={s} />
          <Hl text={c.f} q={q.trim()} />
          <div className="row" style={{ gap: 10, marginTop: 2 }}>
            {ex > 0 && <Link href={`/dictionnaire/${c.id}#exemples`} className="note">{ex} exemple{ex > 1 ? "s" : ""}</Link>}
            <button onClick={() => fav(c.id)} aria-pressed={isFav} aria-label={isFav ? `Retirer ${c.g} des favoris` : `Ajouter ${c.g} aux favoris`} style={{ background: "none", border: 0, cursor: "pointer", fontSize: 16, color: isFav ? "var(--ac2)" : "var(--mu)", padding: 0 }}>{isFav ? "★" : "☆"}</button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <h1>Dictionnaire</h1>
      <p className="mu">{C.length} entrées · une fiche pour chaque mot.</p>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher en galme ou en français" aria-label="Rechercher dans le dictionnaire" />

      {!q && P.searches.length > 0 && (
        <div className="row" style={{ marginTop: 8 }} aria-label="Historique des recherches">
          <span className="note">Récent :</span>
          {P.searches.slice(0, 6).map((s) => <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>)}
          <button className="chip" onClick={() => update((p) => { p.searches = []; })} aria-label="Effacer l'historique">✕</button>
        </div>
      )}
      {!q && P.recent.length > 0 && (
        <div className="row" style={{ marginTop: 8 }}>
          <span className="note">Consultés :</span>
          {P.recent.slice(0, 6).map((id) => <Link key={id} href={`/dictionnaire/${id}`} className="chip" style={{ textDecoration: "none" }}>{C[id].g}</Link>)}
        </div>
      )}

      <div className="row" style={{ margin: "12px 0 6px" }} role="group" aria-label="Filtrer par catégorie">
        {["", ...TO].map((t) => <button key={t} className={`chip ${tp === t ? "on" : ""}`} onClick={() => setTp(t)}>{t || "Tout"}</button>)}
      </div>
      <div className="row" role="group" aria-label="Filtrer par statut">
        {FILTERS.map(([k, l]) => <button key={k} className={`chip ${flt === k ? "on" : ""}`} onClick={() => setFlt(k)}>{l}</button>)}
      </div>
      <p className="note" role="status">{list.length} résultat{list.length > 1 ? "s" : ""}</p>

      {list.length === 0 && <p className="mu">Aucun résultat.</p>}
      {flat ? (
        <table><tbody>{list.map(row)}</tbody></table>
      ) : (
        groups.map((t) => (
          <Fragment key={t}>
            <h2 style={{ marginTop: 18 }}>{TT[t]}</h2>
            <table><tbody>{list.filter((c) => c.t === t).map(row)}</tbody></table>
          </Fragment>
        ))
      )}
    </>
  );
}
