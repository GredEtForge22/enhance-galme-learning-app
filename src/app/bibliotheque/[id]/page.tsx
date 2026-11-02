"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { C, LEVELS, textById } from "@/data/galme";
import { Sentence } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function TextePage() {
  const { id } = useParams<{ id: string }>();
  const t = textById(id);
  const { P, update, account, toast } = useStore();
  const [hide, setHide] = useState(false);
  const [round, setRound] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  if (!t) return <div className="box"><h2>Texte introuvable</h2><Link className="btn" href="/bibliotheque">Retour à la bibliothèque</Link></div>;
  const fav = P.fav.texts.includes(t.id);
  const st = P.texts[t.id];
  const back = encodeURIComponent(`/bibliotheque/${t.id}`);

  const share = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/shares", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ textId: t.id, comment }) });
      const j = await r.json();
      toast(r.ok ? "Texte partagé dans la communauté." : j.error || "Échec du partage.");
      if (r.ok) setComment("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="note"><Link href="/bibliotheque">← Bibliothèque</Link> · {LEVELS[t.level - 1].name}</p>
      <div className="row between">
        <h1 style={{ margin: 0 }}>{t.title}</h1>
        <button className="chip" aria-pressed={fav} onClick={() => update((p) => { p.fav.texts = fav ? p.fav.texts.filter((x) => x !== t.id) : [...p.fav.texts, t.id]; })}>{fav ? "★ Favori" : "☆ Favori"}</button>
      </div>
      <p className="mu">{t.desc}</p>

      <div className="row" role="group" aria-label="Mode de lecture" style={{ margin: "10px 0" }}>
        <button className={`chip ${!hide ? "on" : ""}`} onClick={() => { setHide(false); setRound((r) => r + 1); }}>Lecture</button>
        <button className={`chip ${hide ? "on" : ""}`} onClick={() => { setHide(true); setRound((r) => r + 1); }}>Traduction masquée</button>
      </div>

      <section className="box" aria-label="Texte">
        {t.lines.map((i) => (
          <div key={`${i}-${round}`} style={{ padding: "10px 0", borderTop: "1px solid var(--bd)" }}>
            <Sentence g={C[i].g} f={C[i].f} hidden={hide} />
          </div>
        ))}
        <p className="note" style={{ marginTop: 8 }}>Touche un mot pour voir sa décomposition.</p>
        <button className="btn alt" onClick={() => update((p) => { p.texts[t.id] = { ...p.texts[t.id], read: true }; })} disabled={st?.read}>{st?.read ? "✓ Texte lu" : "Marquer comme lu"}</button>
      </section>

      <section className="box" aria-labelledby="ex">
        <h2 id="ex">Exercices associés</h2>
        {st?.best !== undefined && <p className="fb ok">Meilleur score : {st.best} %</p>}
        <div className="grid">
          <Link className="ch" style={{ marginTop: 0 }} href={`/jouer?mode=texte&text=${t.id}&sub=compr&back=${back}`}>Questions de compréhension<small>3 questions sur le texte</small></Link>
          <Link className="ch" style={{ marginTop: 0 }} href={`/jouer?mode=texte&text=${t.id}&sub=tcloze&back=${back}`}>Texte à trous<small>Complète les mots manquants</small></Link>
          <Link className="ch" style={{ marginTop: 0 }} href={`/jouer?mode=texte&text=${t.id}&sub=ttrans&back=${back}`}>Traduire le texte<small>Ligne par ligne, en galme</small></Link>
          <Link className="ch" style={{ marginTop: 0 }} href={`/jouer?mode=texte&text=${t.id}&back=${back}`}>Tout enchaîner<small>Compréhension, trous et traduction</small></Link>
        </div>
      </section>

      <section className="box" aria-labelledby="sh">
        <h2 id="sh">Partager</h2>
        {account ? (
          <>
            <label htmlFor="cm">Un petit mot (facultatif)</label>
            <input id="cm" type="text" value={comment} maxLength={200} onChange={(e) => setComment(e.target.value)} />
            <button className="btn alt" onClick={share} disabled={busy}>Partager dans l&apos;espace communautaire</button>
          </>
        ) : (
          <p className="note">Connecte-toi pour partager ce texte avec la communauté. <Link href="/compte">Se connecter</Link></p>
        )}
      </section>
    </>
  );
}
