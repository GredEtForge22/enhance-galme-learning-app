"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { C, GRAMMAR, LEVELS, LESSONS, NOTES, PRON, U, examplesOf, lessonById } from "@/data/galme";
import { Bar, Sentence } from "@/components/ui";
import { lessonProgress, statusOf } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { day } from "@/lib/text";

const SECTIONS = [
  { id: "regle", label: "Règles" },
  { id: "vocab", label: "Vocabulaire" },
  { id: "exemples", label: "Exemples" },
  { id: "quiz", label: "Quiz" },
  { id: "exercices", label: "Exercices" },
];

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = lessonById(id);
  const { P, update } = useStore();
  const st = lesson ? P.lessons[lesson.id] : undefined;
  const [tab, setTab] = useState<string>(() => SECTIONS.find((s) => !st?.sec.includes(s.id) && s.id !== "quiz" && s.id !== "exercices")?.id ?? "regle");

  const mark = (sec: string) => {
    if (!lesson) return;
    update((p) => {
      const l = p.lessons[lesson.id] || (p.lessons[lesson.id] = { sec: [] });
      if (!l.sec.includes(sec)) l.sec.push(sec);
      p.resume.lesson = lesson.id;
      if (sec === "vocab") {
        const t = day();
        lesson.ids.forEach((i) => {
          if (!p.cards[i]) p.cards[i] = { b: 0, due: t, ok: 0, ko: 0, seen: t };
        });
      }
    });
  };
  useEffect(() => {
    if (lesson && (tab === "regle" || tab === "vocab" || tab === "exemples") && !P.lessons[lesson.id]?.sec.includes(tab)) mark(tab);
    else if (lesson && P.resume.lesson !== lesson.id) update((p) => { p.resume.lesson = lesson.id; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, lesson?.id]);

  const examples = useMemo(() => {
    if (!lesson) return [];
    const set = new Map<number, (typeof C)[number]>();
    lesson.ids.forEach((i) => {
      const e = C[i];
      if (e.u === 5) set.set(e.id, e);
      else examplesOf(e).forEach((s) => set.set(s.id, s));
    });
    return [...set.values()].slice(0, 10);
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="box"><h2>Leçon introuvable</h2><Link className="btn" href="/apprendre">Retour au parcours</Link></div>
    );
  }
  const prev = LESSONS[lesson.index - 1], next = LESSONS[lesson.index + 1];
  const lv = LEVELS.find((l) => l.n === lesson.level);
  const before = [...new Set(LESSONS.slice(0, lesson.index).map((l) => l.unit).filter((u) => u !== lesson.unit))];
  const rules = [...new Set(GRAMMAR.filter((g) => g.u.includes(lesson.unit)).map((g) => g.rule))];
  const back = encodeURIComponent(`/apprendre/${lesson.id}`);

  return (
    <>
      <p className="note"><Link href="/apprendre">← Parcours</Link> · Niveau {lesson.level} · {lv?.name}</p>
      <h1>{lesson.title}</h1>
      <div className="row between"><span className="note">{st?.done ? "✓ Leçon terminée" : "Progression du chapitre"}</span><b>{lessonProgress(P, lesson.id)} %</b></div>
      <Bar pct={lessonProgress(P, lesson.id)} kind={st?.done ? "g" : "a"} />

      <nav className="tabs" aria-label="Table des matières de la leçon" role="tablist">
        {SECTIONS.map((s) => (
          <button key={s.id} role="tab" aria-selected={tab === s.id} className={`tab ${tab === s.id ? "on" : ""}`} onClick={() => setTab(s.id)}>
            {st?.sec.includes(s.id) && <span className="ck" aria-label="terminé">✓ </span>}{s.label}
          </button>
        ))}
      </nav>

      <section className="box" role="tabpanel" aria-label={SECTIONS.find((s) => s.id === tab)?.label}>
        {tab === "regle" && (
          <>
            <h2>Règles du chapitre</h2>
            <p className="note" dangerouslySetInnerHTML={{ __html: NOTES[lesson.unit] }} />
            {rules.length > 0 && (
              <>
                <h3 style={{ marginTop: 12 }}>À retenir</h3>
                <ul style={{ margin: "4px 0", paddingLeft: 20 }}>{rules.map((r) => <li key={r} className="note">{r}</li>)}</ul>
              </>
            )}
            {lesson.level === 1 && <p className="note" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: PRON }} />}
            {before.length > 0 && (
              <details>
                <summary>Rappel des règles déjà étudiées</summary>
                {before.map((u) => <div key={u}><h3>{U[u]}</h3><p className="note" dangerouslySetInnerHTML={{ __html: NOTES[u] }} /></div>)}
              </details>
            )}
          </>
        )}

        {tab === "vocab" && (
          <>
            <h2>Vocabulaire ({lesson.ids.length})</h2>
            <p className="note">Ouvre une fiche pour voir les exemples et les formes de chaque entrée.</p>
            <table>
              <tbody>
                {lesson.ids.map((i) => (
                  <tr key={i}>
                    <td><Link href={`/dictionnaire/${i}`} style={{ color: "inherit", textDecoration: "none" }}>{C[i].g}</Link></td>
                    <td><span className={`dot ${statusOf(P, i) === "new" ? "" : statusOf(P, i)}`} />{C[i].f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === "exemples" && (
          <>
            <h2>Exemples interactifs</h2>
            <p className="note">Touche un mot pour voir sa décomposition (racine, passé, futur, question…).</p>
            {examples.length === 0 && <p className="mu">Aucune phrase du corpus ne contient ces mots.</p>}
            {examples.map((s) => (
              <div key={s.id} style={{ borderTop: "1px solid var(--bd)", padding: "10px 0" }}><Sentence g={s.g} f={s.f} hidden /></div>
            ))}
          </>
        )}

        {tab === "quiz" && (
          <>
            <h2>Quiz de compréhension</h2>
            <p className="note">Six questions sur les mots et les règles de ce chapitre. Seuil : 60 %.</p>
            {st?.quiz !== undefined && <p className="fb ok">Meilleur score : {st.quiz} %</p>}
            <Link className="btn" href={`/jouer?mode=quiz&lesson=${lesson.id}&back=${back}`}>{st?.quiz !== undefined ? "Refaire le quiz" : "Commencer le quiz"}</Link>
          </>
        )}

        {tab === "exercices" && (
          <>
            <h2>Exercices de fin de leçon</h2>
            <p className="note">Une séance variée sur les mots du chapitre. Seuil : 70 %. La leçon est terminée quand le quiz et les exercices sont réussis.</p>
            {st?.ex !== undefined && <p className="fb ok">Meilleur score : {st.ex} %</p>}
            <Link className="btn" href={`/jouer?mode=lecon&lesson=${lesson.id}&back=${back}`}>{st?.done ? "Réviser la leçon" : st?.ex !== undefined ? "Refaire les exercices" : "Commencer les exercices"}</Link>
          </>
        )}
      </section>

      <div className="row between" style={{ marginTop: 14 }}>
        {prev ? <Link className="btn sm alt" href={`/apprendre/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next ? <Link className="btn sm alt" href={`/apprendre/${next.id}`}>{next.title} →</Link> : <Link className="btn sm alt" href="/apprendre">Retour au parcours</Link>}
      </div>
    </>
  );
}
