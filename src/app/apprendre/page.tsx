"use client";
import Link from "next/link";
import { C, LEVELS, LESSONS, lessonById, levelWords } from "@/data/galme";
import { Bar, Stat } from "@/components/ui";
import { counts, levelDone, levelLessons, lessonProgress, masteredIn, masteryPct, overallPct } from "@/lib/stats";
import { useStore } from "@/lib/store";

export default function Apprendre() {
  const { P } = useStore();
  const cn = counts(P);
  const resume = lessonById(P.resume.lesson ?? "");
  const next = LESSONS.find((l) => !P.lessons[l.id]?.done);
  const target = resume && !P.lessons[resume.id]?.done ? resume : next;

  return (
    <>
      <h1>Apprendre</h1>
      <p className="mu">Parcours, niveaux et leçons. Chaque niveau se termine par un examen.</p>

      <section className="box" aria-labelledby="gp">
        <div className="row between"><h2 id="gp" style={{ margin: 0 }}>Progression générale</h2><b>{overallPct(P)} %</b></div>
        <Bar pct={overallPct(P)} kind="a" />
        <div className="row between" style={{ marginTop: 12 }}><span className="note">Maîtrise du vocabulaire</span><b>{masteryPct(P)} %</b></div>
        <Bar pct={masteryPct(P)} kind="g" />
        <div className="stats four" style={{ marginBottom: 0 }}>
          <Stat v={cn.new} l="non vus" />
          <Stat v={cn.seen} l="découverts" />
          <Stat v={cn.learning} l="en cours" warm />
          <Stat v={cn.mastered} l="maîtrisés" />
        </div>
        {target && (
          <Link className="btn" href={`/apprendre/${target.id}`}>
            {resume && target.id === resume.id ? `Reprendre : ${target.title}` : `Continuer : ${target.title}`}
          </Link>
        )}
      </section>

      {LEVELS.map((lv) => {
        const ls = levelLessons(lv.n);
        const done = levelDone(P, lv.n);
        const ids = levelWords(lv.n).map((c) => c.id);
        const ex = P.exams["n" + lv.n];
        return (
          <section key={lv.n} className="box" aria-labelledby={`lv${lv.n}`}>
            <div className="row between">
              <h2 id={`lv${lv.n}`} style={{ margin: 0 }}>Niveau {lv.n} · {lv.name}</h2>
              <span className="tag">{done}/{ls.length} leçons</span>
            </div>
            <p className="note" style={{ marginTop: 2 }}>{lv.desc} · {masteredIn(P, ids)}/{ids.length} entrées maîtrisées</p>
            <Bar pct={(done / ls.length) * 100} kind="a" />
            {ls.map((l) => {
              const st = P.lessons[l.id];
              return (
                <div key={l.id} className="row" style={{ marginTop: 8, flexWrap: "nowrap" }}>
                  <Link href={`/apprendre/${l.id}`} className="ch" style={{ marginTop: 0, flex: 1 }}>
                    {st?.done ? "✓ " : ""}{l.title}
                    <small>{l.ids.length} entrées · {st?.done ? "terminée" : `${lessonProgress(P, l.id)} % du chapitre`}</small>
                  </Link>
                  {st?.done && <Link className="btn sm alt" href={`/jouer?mode=lecon&lesson=${l.id}&back=/apprendre`}>Réviser</Link>}
                </div>
              );
            })}
            <Link href={`/jouer?mode=examen-niveau&niveau=${lv.n}&back=/apprendre`} className="btn alt">
              {ex?.passed ? `Examen réussi (${ex.best} %) · repasser` : ex ? `Examen du niveau (meilleur : ${ex.best} %)` : "Passer l'examen du niveau"}
            </Link>
            <p className="lock-note" style={{ marginTop: 4 }}>20 questions chronométrées · seuil de réussite 80 %</p>
          </section>
        );
      })}
      <p className="note" style={{ marginTop: 14 }}>{C.length} entrées au total dans le corpus du Galme.</p>
    </>
  );
}
