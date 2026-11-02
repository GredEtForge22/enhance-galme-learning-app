"use client";
import Link from "next/link";
import { BADGES } from "@/lib/gamification";
import { Bar, Stat } from "@/components/ui";
import { bestStreak, learnedWords, lessonsDone, levelOf, masteredSentences, streak, successRate, totalSecs } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { fmtTime } from "@/lib/text";

export default function Profil() {
  const { P, account } = useStore();
  const lv = levelOf(P.xp);
  const got = BADGES.filter((b) => P.badges[b.id]).length;
  const name = P.settings.name || account?.pseudo || "Apprenant";
  const rush = Object.entries(P.rec.rush);
  const records: [string, string | number][] = [
    ["Meilleure série de jours", `${bestStreak(P)} j`],
    ["Record de réponses en un jour", P.rec.bestDay],
    ...(["facile", "normal", "difficile"] as const).map((d): [string, number] => [`Contre-la-montre · ${d}`, P.rec.rush[d] ?? 0]),
    ["Mode survie", P.rec.survie],
    ["Mode marathon", P.rec.marathon],
    ["Mode sans faute", P.rec.nofault],
    ["Séances parfaites (100 %)", P.perfect],
  ];
  void rush;
  return (
    <>
      <section className="box" style={{ marginTop: 4 }}>
        <div className="row" style={{ flexWrap: "nowrap", gap: 14 }}>
          <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ac)", color: "var(--on)", display: "flex", alignItems: "center", justifyContent: "center", font: "400 30px var(--serif)", flex: "none" }}>{name.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, overflowWrap: "anywhere" }}>{name}</h1>
            <p className="mu" style={{ margin: 0 }}>Niveau {lv.n} · {lv.name}</p>
          </div>
        </div>
        <div className="top" style={{ marginTop: 12 }}><span>{P.xp} XP</span><span>prochain niveau : {lv.next} XP</span></div>
        <Bar pct={lv.pct} />
      </section>

      <div className="stats four">
        <Stat v={streak(P)} l="série en cours" warm />
        <Stat v={`${successRate(P)} %`} l="taux de réussite" />
        <Stat v={learnedWords(P)} l="mots appris" />
        <Stat v={masteredSentences(P)} l="phrases maîtrisées" warm />
        <Stat v={lessonsDone(P)} l="leçons terminées" />
        <Stat v={fmtTime(totalSecs(P))} l="temps passé" />
        <Stat v={`${got}/${BADGES.length}`} l="badges" warm />
        <Stat v={P.sessions} l="séances" />
      </div>

      <section className="box" aria-labelledby="bg">
        <h2 id="bg">Badges</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {BADGES.map((b) => (
            <div key={b.id} className={`bdg ${P.badges[b.id] ? "" : "lock"}`} title={b.desc}>
              <span className="ic" aria-hidden="true">{b.icon}</span>
              <b>{b.name}</b>
              <small>{P.badges[b.id] ? "Obtenu" : b.desc}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="box" aria-labelledby="rc">
        <h2 id="rc">Records personnels</h2>
        <table><tbody>{records.map(([k, v]) => <tr key={k}><td style={{ font: "inherit" }}>{k}</td><td><b>{v}</b></td></tr>)}</tbody></table>
      </section>

      <div className="grid" style={{ marginTop: 12 }}>
        <Link href="/statistiques" className="ch" style={{ marginTop: 0 }}>Statistiques détaillées<small>Graphiques, calendrier, catégories</small></Link>
        <Link href="/communaute" className="ch" style={{ marginTop: 0 }}>Communauté<small>Classements, défi de la semaine, partages</small></Link>
        <Link href="/compte" className="ch" style={{ marginTop: 0 }}>{account ? `Compte · ${account.pseudo}` : "Compte et synchronisation"}<small>{account ? "Progression synchronisée entre appareils" : "Crée un compte pour synchroniser tes appareils"}</small></Link>
        <Link href="/parametres" className="ch" style={{ marginTop: 0 }}>Paramètres<small>Thème, objectifs, sauvegarde, notifications</small></Link>
        <Link href="/fonctionnement" className="ch" style={{ marginTop: 0 }}>Comment fonctionne l&apos;apprentissage<small>Répétition espacée, niveaux, XP</small></Link>
        <Link href="/a-propos" className="ch" style={{ marginTop: 0 }}>À propos de Galme<small>Présentation et crédits</small></Link>
      </div>
    </>
  );
}
