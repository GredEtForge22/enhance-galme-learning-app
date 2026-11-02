"use client";
import Link from "next/link";
import { C, LESSONS, lessonById } from "@/data/galme";
import { Bar, BarChart, Stat } from "@/components/ui";
import { counts, levelOf, masteredWords, overallPct, streak, sumDays } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { day, dayDate, fmtTime } from "@/lib/text";

export default function Home() {
  const { P } = useStore();
  const t = day();
  const today = P.days[t] ?? { a: 0, c: 0, s: 0, x: 0 };
  const goal = P.settings.goal;
  const due = C.filter((c) => P.cards[c.id] && P.cards[c.id].due <= t).length;
  const left = C.filter((c) => !P.cards[c.id]).length;
  const lv = levelOf(P.xp);
  const cn = counts(P);
  const next = lessonById(P.resume.lesson ?? "") ?? LESSONS.find((l) => !P.lessons[l.id]?.done) ?? LESSONS[0];
  const resuming = !!P.resume.lesson && !P.lessons[P.resume.lesson]?.done;
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = t - 6 + i;
    return { label: "DLMMJVS"[dayDate(d).getUTCDay()], v: P.days[d]?.a ?? 0, v2: P.days[d]?.c ?? 0 };
  });
  const errs = Object.keys(P.errs).length;
  const dailyDone = P.daily.d === t && P.daily.done;
  const week7 = sumDays(P, t - 6, t);

  return (
    <>
      <h1>{P.settings.name ? `Bonjour, ${P.settings.name}` : "Bonjour"}</h1>
      <p className="mu">Ton tableau de bord Galme : une séance courte chaque jour suffit pour progresser.</p>

      <div className="stats">
        <Stat v={streak(P)} l="jours d'affilée" warm />
        <Stat v={masteredWords(P)} l="mots maîtrisés" />
        <Stat v={`Niv. ${lv.n}`} l={`${lv.name} · ${P.xp} XP`} />
      </div>

      <section className="box" aria-labelledby="h-jour">
        <h2 id="h-jour">Séance du jour</h2>
        <p className="mu">{due} à réviser · {Math.min(6, left)} nouveaux mots · {fmtTime(today.s)} aujourd&apos;hui</p>
        <div className="top"><span>Objectif quotidien</span><span>{Math.min(today.a, goal)} / {goal} réponses</span></div>
        <Bar pct={(today.a / goal) * 100} kind={today.a >= goal ? "g" : ""} />
        <Link href="/jouer?mode=jour&back=/" className="btn">{today.a ? "Reprendre une séance" : "Commencer la séance"}</Link>
      </section>

      <div className="grid" style={{ marginTop: 12 }}>
        <section className="box" style={{ marginTop: 0 }}>
          <h2>{resuming ? "Reprendre la leçon" : "Parcours"}</h2>
          <p className="mu">{next.title}</p>
          <Bar pct={overallPct(P)} kind="a" />
          <p className="note">Parcours complété à {overallPct(P)} %</p>
          <Link href={`/apprendre/${next.id}`} className="btn alt">{resuming ? "Reprendre" : "Continuer le parcours"}</Link>
        </section>
        <section className="box" style={{ marginTop: 0 }}>
          <h2>Défi quotidien</h2>
          <p className="mu">{dailyDone ? `Relevé aujourd'hui : ${P.daily.score} %` : "10 questions, un défi différent chaque jour."}</p>
          <Link href="/jouer?mode=defi&back=/" className="btn alt">{dailyDone ? "Rejouer" : "Relever le défi"}</Link>
        </section>
      </div>

      <section className="box">
        <h2>Ma maîtrise du vocabulaire</h2>
        <Bar pct={(cn.mastered / C.length) * 100} kind="g" />
        <div className="stats four" style={{ marginBottom: 0 }}>
          <Stat v={cn.new} l="non vus" />
          <Stat v={cn.seen} l="découverts" />
          <Stat v={cn.learning} l="en cours" warm />
          <Stat v={cn.mastered} l="maîtrisés" />
        </div>
      </section>

      <section className="box">
        <div className="row between"><h2 style={{ margin: 0 }}>7 derniers jours</h2><span className="note">{week7.a} réponses</span></div>
        <BarChart data={week} h={100} />
      </section>

      <div className="grid" style={{ marginTop: 12 }}>
        <Link href="/jouer?mode=erreurs&back=/" className="ch" style={{ marginTop: 0 }}>
          Réviser mes erreurs <small>{errs ? `${errs} élément${errs > 1 ? "s" : ""} à reprendre` : "Aucune erreur en attente"}</small>
        </Link>
        <Link href="/s-entrainer" className="ch" style={{ marginTop: 0 }}>S&apos;entraîner <small>Exercices, jeux et défis</small></Link>
        <Link href="/bibliotheque" className="ch" style={{ marginTop: 0 }}>Bibliothèque <small>Lire des textes en galme</small></Link>
        <Link href="/communaute" className="ch" style={{ marginTop: 0 }}>Communauté <small>Classements et défi de la semaine</small></Link>
      </div>
    </>
  );
}
