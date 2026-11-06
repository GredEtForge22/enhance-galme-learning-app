"use client";
import Link from "next/link";
import { useState } from "react";
import { TO } from "@/data/galme";
import { KIND_LABEL, type Kind } from "@/lib/questions";
import { useStore } from "@/lib/store";

type Mode = { href: string; title: string; desc: string };
const B = "&back=/s-entrainer";
const sessions = (errs: number): Mode[] => [
  { href: `/jouer?mode=jour${B}`, title: "Séance du jour", desc: "Révisions, nouveaux mots et association" },
  { href: `/jouer?mode=erreurs${B}`, title: "Révision des erreurs", desc: errs ? `${errs} élément${errs > 1 ? "s" : ""} à reprendre` : "Aucune erreur en attente" },
  { href: `/jouer?mode=intensif${B}`, title: "Révision intensive", desc: "Uniquement les mots difficiles" },
];
const exos: Mode[] = [
  { href: `/jouer?mode=dictee${B}`, title: "Dictées en galme", desc: "Mémorise le mot, puis écris-le" },
  { href: `/jouer?mode=tr-fg${B}`, title: "Traduction français → galme", desc: "Écris la réponse en galme" },
  { href: `/jouer?mode=tr-gf${B}`, title: "Traduction galme → français", desc: "Choisis la bonne traduction" },
  { href: `/jouer?mode=compr${B}`, title: "Compréhension écrite", desc: "Lis un texte, réponds aux questions" },
  {
    href: `/jouer?mode=compr-orale${B}`,
    title: "Compréhension orale",
    desc: "Écoute un extrait puis choisis la bonne réponse",
  },
  { href: `/jouer?mode=tcloze${B}`, title: "Textes à trous", desc: "Complète les mots manquants" },
  { href: `/jouer?mode=ordre${B}`, title: "Phrases à remettre dans l'ordre", desc: "Reconstitue la phrase en galme" },
  { href: `/jouer?mode=gram${B}`, title: "Questions de grammaire", desc: "Les règles du galme" },
  { href: `/jouer?mode=ending${B}`, title: "Terminaisons", desc: "Variantes, -ko, -sha, -vo" },
  { href: `/jouer?mode=particle${B}`, title: "Particules", desc: "pre-, fu-, petits mots" },
  { href: `/jouer?mode=cat${B}`, title: "Catégories grammaticales", desc: "Nom, verbe, adjectif…" },
  { href: `/jouer?mode=correct${B}`, title: "Correction de phrases", desc: "Trouve la phrase correcte" },
  { href: `/jouer?mode=ttrans${B}`, title: "Traduction de textes entiers", desc: "Traduis un texte ligne par ligne" },
  { href: `/jouer?mode=flip${B}`, title: "Cartes à retourner", desc: "Je devine, puis je vérifie" },
  { href: `/jouer?mode=memo${B}`, title: "Mémory", desc: "Retrouve les paires" },
  { href: `/jouer?mode=compr-orale${B}`, title: "Compréhension orale", desc: "Écoute un extrait et réponds aux questions" },
  { href: "/oral/parler", title: "Expression orale", desc: "Enregistre ta réponse puis réécoute-la" },
];
const KS = Object.entries(KIND_LABEL)
  .filter(([k]) =>
    !["match", "compr", "compr-orale", "tcloze", "ttrans", "flip"].includes(k)
  )
  as [Kind, string][];

export default function Entrainer() {
  const { P } = useStore();
  const errs = Object.keys(P.errs).length;
  const [cat, setCat] = useState("all");
  const [n, setN] = useState(15);
  const [ks, setKs] = useState<Kind[]>(["qf", "fq", "type"]);
  const rec = P.rec;
  const jeux: Mode[] = [
    ...(["facile", "normal", "difficile"] as const).map((d) => ({
      href: `/jouer?mode=rush&diff=${d}${B}`,
      title: `Contre-la-montre · ${d}`,
      desc: `${d === "facile" ? 90 : d === "normal" ? 60 : 45} s · record : ${rec.rush[d] ?? 0}`,
    })),
    { href: `/jouer?mode=survie${B}`, title: "Mode survie", desc: `Jusqu'à la première erreur · record : ${rec.survie}` },
    { href: `/jouer?mode=defi${B}`, title: "Défi quotidien", desc: P.daily.d === Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5) && P.daily.done ? `Relevé aujourd'hui (${P.daily.score} %)` : "Un défi différent chaque jour" },
    { href: `/jouer?mode=marathon${B}`, title: "Mode marathon", desc: `40 exercices enchaînés · record : ${rec.marathon}` },
    { href: `/jouer?mode=sansfaute${B}`, title: "Mode sans faute", desc: `15 d'affilée sans erreur · record : ${rec.nofault}` },
    { href: `/jouer?mode=aleatoire${B}`, title: "Mode aléatoire", desc: "Tous les exercices mélangés" },
    { href: `/jouer?mode=inverse${B}`, title: "Traduction inversée", desc: "Dans les deux directions" },
    { href: `/jouer?mode=examen${B}`, title: "Examen chronométré", desc: "20 questions · 10 min · seuil 80 %" },
  ];
  const custom = `/jouer?mode=perso&cat=${encodeURIComponent(cat)}&n=${n}&k=${ks.join(",")}${B}`;
  const Grid = ({ list }: { list: Mode[] }) => (
    <div className="grid">
      {list.map((m) => (
        <Link key={m.title} href={m.href} className="ch" style={{ marginTop: 0 }}>{m.title}<small>{m.desc}</small></Link>
      ))}
    </div>
  );
  return (
    <>
      <h1>S&apos;entraîner</h1>
      <p className="mu">Exercices, jeux et révisions. Tout utilise le vocabulaire et les règles existants.</p>

      <h2 style={{ marginTop: 20 }}>Séances</h2>
      <Grid list={sessions(errs)} />

      <section className="box" aria-labelledby="perso">
        <h2 id="perso">Entraînement personnalisé</h2>
        <label htmlFor="pc">Catégorie</label>
        <select id="pc" value={cat} onChange={(e) => setCat(e.target.value)} style={{ background: "var(--bg)", color: "var(--tx)", border: "2px solid var(--bd)", borderRadius: 10, padding: 8 }}>
          <option value="all">Tout le dictionnaire</option>
          {TO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label htmlFor="pn">Nombre de questions</label>
        <div className="row" id="pn" role="group">
          {[10, 15, 25, 40].map((v) => <button key={v} className={`chip ${n === v ? "on" : ""}`} onClick={() => setN(v)}>{v}</button>)}
        </div>
        <label>Types d&apos;exercices</label>
        <div className="row">
          {KS.map(([k, l]) => (
            <button key={k} className={`chip ${ks.includes(k) ? "on" : ""}`} aria-pressed={ks.includes(k)} onClick={() => setKs(ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k])}>{l}</button>
          ))}
        </div>
        <Link className="btn" href={ks.length ? custom : "#"} aria-disabled={!ks.length}>Lancer l&apos;entraînement</Link>
      </section>

      <h2 style={{ marginTop: 24 }}>Exercices</h2>
      <Grid list={exos} />
      <h2 style={{ marginTop: 24 }}>Jeux et défis</h2>
      <Grid list={jeux} />
    </>
  );
}
