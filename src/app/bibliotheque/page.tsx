"use client";
import Link from "next/link";
import { useState } from "react";
import { LEVELS, TEXTS } from "@/data/galme";
import { useStore } from "@/lib/store";

export default function Biblio() {
  const { P, update } = useStore();
  const [lvl, setLvl] = useState(0);
  const [favOnly, setFavOnly] = useState(false);
  const list = TEXTS.filter((t) => (!lvl || t.level === lvl) && (!favOnly || P.fav.texts.includes(t.id)));
  return (
    <>
      <h1>Bibliothèque</h1>
      <p className="mu">Des textes en galme assemblés à partir des phrases et des mots du corpus, avec traduction française.</p>
      <div className="row" style={{ margin: "12px 0" }} role="group" aria-label="Filtres">
        <button className={`chip ${lvl === 0 ? "on" : ""}`} onClick={() => setLvl(0)}>Tous niveaux</button>
        {LEVELS.map((l) => <button key={l.n} className={`chip ${lvl === l.n ? "on" : ""}`} onClick={() => setLvl(l.n)}>{l.name}</button>)}
        <button className={`chip ${favOnly ? "on" : ""}`} aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}>Favoris ★</button>
      </div>
      {list.length === 0 && <p className="mu">Aucun texte ne correspond.</p>}
      <div className="grid">
        {list.map((t) => {
          const fav = P.fav.texts.includes(t.id);
          const st = P.texts[t.id];
          return (
            <article key={t.id} className="box" style={{ marginTop: 0 }}>
              <div className="row between">
                <span className="tag">{LEVELS[t.level - 1].name}</span>
                <button onClick={() => update((p) => { p.fav.texts = fav ? p.fav.texts.filter((x) => x !== t.id) : [...p.fav.texts, t.id]; })} aria-pressed={fav} aria-label={fav ? `Retirer ${t.title} des favoris` : `Ajouter ${t.title} aux favoris`} style={{ background: "none", border: 0, cursor: "pointer", fontSize: 20, color: fav ? "var(--ac2)" : "var(--mu)" }}>{fav ? "★" : "☆"}</button>
              </div>
              <h2 style={{ marginTop: 6 }}>{t.title}</h2>
              <p className="note">{t.desc} · {t.lines.length} lignes</p>
              <p className="note">{st?.read ? "✓ Lu" : "Pas encore lu"}{st?.best !== undefined ? ` · exercices : ${st.best} %` : ""}</p>
              <Link href={`/bibliotheque/${t.id}`} className="btn">Lire</Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
