"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bar } from "@/components/ui";
import { QuestionView, goodOf, type Result } from "@/components/Exercise";
import { IV, type Progress } from "@/lib/progress";
import { makeQuestion, type Item, type Question } from "@/lib/questions";
import type { SessionCfg } from "@/lib/sessions";
import { useStore } from "@/lib/store";
import { day, fmtTime } from "@/lib/text";

type Summary = { a: number; c: number; pct: number; secs: number; xp: number; passed: boolean | null; score: number | null; record: string | null; errors: { q: string; good: string }[] };

function lessonCheck(p: Progress, id: string): number {
  const l = p.lessons[id];
  if (l && !l.done && (l.quiz ?? -1) >= 60 && (l.ex ?? -1) >= 70) {
    l.done = true;
    p.xp += 50;
    return 50;
  }
  return 0;
}

export function Runner({ cfg, back, backLabel, onAgain }: { cfg: SessionCfg; back: string; backLabel: string; onAgain: () => void }) {
  const { P, update, toast, account } = useStore();
  const queue = useRef<Item[]>([...cfg.items]);
  const [cur, setCur] = useState<Item | null>(null);
  const [q, setQ] = useState<Question | null>(null);
  const [fb, setFb] = useState<{ ok: boolean; good: string; note?: string } | null>(null);
  const [remaining, setRemaining] = useState(cfg.items.length);
  const [left, setLeft] = useState(cfg.timer ?? 0);
  const [qid, setQid] = useState(0);
  const [live, setLive] = useState({ a: 0, c: 0, pts: 0 });
  const [summary, setSummary] = useState<Summary | null>(null);
  const st = useRef({ a: 0, c: 0, xp: 0, pts: 0, errors: [] as { q: string; good: string }[], t0: Date.now() });
  const ended = useRef(false);
  const stop = useRef(false);
  const started = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const total0 = cfg.items.length;

  const finish = () => {
    if (ended.current) return;
    ended.current = true;
    const s = st.current;
    const t = day();
    const den = cfg.pass && cfg.timer ? Math.max(s.a, total0) : s.a;
    const pct = den ? Math.round((s.c / den) * 100) : 0;
    const passed = cfg.pass ? pct >= cfg.pass : null;
    let bonus = 0;
    let record: string | null = null;
    let score: number | null = null;
    update((p) => {
      p.sessions++;
      if (s.a >= 8 && s.c === s.a) {
        p.perfect++;
        bonus += 20;
      }
      const m = cfg.mode;
      if (m === "rush") {
        score = s.pts;
        const d = cfg.meta.diff;
        const prev = p.rec.rush[d] || 0;
        if (s.pts > prev) {
          if (prev > 0) p.flags.rushRecord = true;
          p.rec.rush[d] = s.pts;
          record = prev > 0 ? "Nouveau record !" : "Premier score enregistré.";
        }
      } else if (m === "survie" || m === "marathon" || m === "sansfaute") {
        score = s.c;
        const k = m === "survie" ? "survie" : m === "marathon" ? "marathon" : "nofault";
        if (s.c > p.rec[k]) {
          p.rec[k] = s.c;
          record = "Nouveau record !";
        }
      } else if (m === "examen-niveau" || m === "examen") {
        const key = cfg.meta.level === "g" ? "g" : "n" + cfg.meta.level;
        const e = p.exams[key] || (p.exams[key] = { best: 0, passed: false, n: 0 });
        e.n++;
        e.best = Math.max(e.best, pct);
        if (passed && !e.passed) {
          e.passed = true;
          bonus += 100;
          record = "Examen validé : +100 XP";
        }
      } else if (m === "lecon" || m === "quiz") {
        const l = p.lessons[cfg.meta.lesson] || (p.lessons[cfg.meta.lesson] = { sec: [] });
        const sec = m === "lecon" ? "exercices" : "quiz";
        if (!l.sec.includes(sec)) l.sec.push(sec);
        if (m === "lecon") l.ex = Math.max(l.ex ?? 0, pct);
        else l.quiz = Math.max(l.quiz ?? 0, pct);
        const b = lessonCheck(p, cfg.meta.lesson);
        if (b) {
          bonus += b;
          record = "Leçon terminée : +50 XP";
        }
      } else if (m === "texte") {
        const x = p.texts[cfg.meta.text] || (p.texts[cfg.meta.text] = {});
        x.best = Math.max(x.best ?? 0, pct);
      } else if (m === "defi") {
        if (!(p.daily.d === t && p.daily.done)) {
          p.daily = { d: t, done: true, score: pct, bonus: t };
          bonus += 40;
          record = "Défi du jour relevé : +40 XP";
        }
      }
      p.xp += bonus;
      const dd = p.days[t] || (p.days[t] = { a: 0, c: 0, s: 0, x: 0 });
      dd.x += bonus;
    });
    if (account && s.a > 0) {
      fetch("/api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: cfg.mode, correct: s.c, total: s.a, xp: s.xp + bonus }) }).catch(() => {});
    }
    setSummary({ a: s.a, c: s.c, pct, secs: Math.round((Date.now() - s.t0) / 1000), xp: s.xp + bonus, passed, score, record, errors: s.errors });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  const advance = () => {
    if (ended.current) return;
    if (stop.current) return finish();
    for (let guard = 0; guard < 60; guard++) {
      if (!queue.current.length && cfg.gen) queue.current.push(...cfg.gen());
      const it = queue.current.shift();
      if (!it) return finish();
      const nq = makeQuestion(it, P);
      if (nq) {
        setCur(it);
        setQ(nq);
        setQid((x) => x + 1);
        setFb(null);
        setRemaining(queue.current.length);
        return;
      }
    }
    finish();
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!cfg.items.length && !cfg.gen) {
      finish();
      return;
    }
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cfg.timer) return;
    const iv = setInterval(() => {
      if (document.hidden || ended.current) return;
      setLeft((l) => {
        if (l <= 1) {
          setTimeout(() => finishRef.current(), 0);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [cfg.timer]);

  useEffect(() => {
    if (fb) nextRef.current?.focus();
  }, [fb]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !summary) window.location.assign(back);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [back, summary]);

  const handle = (r: Result) => {
    if (!q || !cur || ended.current) return;
    const t = day();
    const ok = r.ok;
    const isMatch = q.type === "match";
    const ids = isMatch ? q.pairs.map((p) => p.id) : q.wordId !== undefined ? [q.wordId] : [];
    const n = isMatch ? q.pairs.length : 1;
    const nErr = isMatch ? (r.errs?.length ?? 0) : ok ? 0 : 1;
    const gain = (n - nErr) * 10 + nErr;
    update((p) => {
      ids.forEach((id) => {
        const errd = isMatch ? (r.errs ?? []).includes(id) : !ok;
        const c = p.cards[id] || (p.cards[id] = { b: 0, due: t, ok: 0, ko: 0, seen: t });
        if (!errd) {
          c.ok++;
          if (!cur.w && (!isMatch || c.due <= t)) {
            c.b = Math.min(c.b + 1, 5);
            c.due = t + IV[c.b];
          }
          delete p.errs[id];
        } else {
          c.b = 0;
          c.due = t;
          c.ko++;
          p.errs[id] = (p.errs[id] || 0) + 1;
        }
      });
      const d = p.days[t] || (p.days[t] = { a: 0, c: 0, s: 0, x: 0 });
      const before = d.a;
      d.a += n;
      d.c += n - nErr;
      d.x += gain;
      p.xp += gain;
      if (before < p.settings.goal && d.a >= p.settings.goal) {
        d.x += 25;
        p.xp += 25;
        toast("🎯 Objectif quotidien atteint : +25 XP");
      }
      p.rec.bestDay = Math.max(p.rec.bestDay, d.a);
      const cs = p.cat[q.cat] || (p.cat[q.cat] = { a: 0, c: 0 });
      cs.a += n;
      cs.c += n - nErr;
      if (ok && (q.sent || q.type === "multi")) p.sentOk++;
    });
    const s = st.current;
    s.a += n;
    s.c += n - nErr;
    s.xp += gain;
    if (ok) s.pts++;
    const good = r.good ?? goodOf(q);
    if (!ok) s.errors.push({ q: "prompt" in q ? `${q.label} — ${q.prompt}` : q.label, good: good || "Voir la correction" });
    if (!ok && cfg.retry && !isMatch && q.wordId !== undefined && (cur.n ?? 0) < 2) queue.current.push({ id: q.wordId, w: true, n: (cur.n ?? 0) + 1 });
    if (!ok && cfg.stopOnError) stop.current = true;
    setLive({ a: s.a, c: s.c, pts: s.pts });
    setFb({ ok, good, note: q.type === "choice" ? q.note : undefined });
  };

  const intro = () => {
    if (!cur || q?.type !== "intro") return;
    const id = cur.id as number;
    const t = day();
    update((p) => {
      if (!p.cards[id]) p.cards[id] = { b: 0, due: t, ok: 0, ko: 0, seen: t };
    });
    const nit = { ...cur, intro: false };
    const nq = makeQuestion(nit, P);
    if (!nq) return advance();
    setCur(nit);
    setQ(nq);
    setQid((x) => x + 1);
  };

  // ---------- Bilan ----------
  if (summary) {
    const s = summary;
    return (
      <div className="box" role="region" aria-label="Bilan de la séance">
        <h2>{s.passed === null ? "Séance terminée" : s.passed ? "Réussi !" : "Pas encore…"}</h2>
        {cfg.mode === "rush" || cfg.mode === "survie" || cfg.mode === "marathon" || cfg.mode === "sansfaute" ? (
          <div className="big">{s.score}</div>
        ) : (
          <div className="big">{s.pct} %</div>
        )}
        <p className="lab">{cfg.mode === "rush" ? "bonnes réponses" : cfg.mode === "survie" || cfg.mode === "marathon" || cfg.mode === "sansfaute" ? "réponses justes d'affilée" : `${s.c} bonne${s.c > 1 ? "s" : ""} réponse${s.c > 1 ? "s" : ""} sur ${s.a}`}</p>
        <div className="stats" style={{ marginBottom: 6 }}>
          <div className="st"><b>{s.a}</b>réponses</div>
          <div className="st"><b>{fmtTime(s.secs)}</b>durée</div>
          <div className="st warm"><b>+{s.xp}</b>XP</div>
        </div>
        {s.record && <p className="fb ok" role="status">{s.record}</p>}
        {s.passed !== null && cfg.pass && <p className="note">Seuil de réussite : {cfg.pass} %.{s.passed ? "" : " Révise puis réessaie."}</p>}
        {cfg.empty && !s.a && <p className="mu">{cfg.empty}</p>}
        {s.errors.length > 0 && (
          <details open>
            <summary>À retenir ({s.errors.length} erreur{s.errors.length > 1 ? "s" : ""})</summary>
            <table>
              <tbody>
                {s.errors.slice(0, 12).map((e, i) => (
                  <tr key={i}><td style={{ font: "inherit", width: "55%" }}>{e.q}</td><td><b>{e.good}</b></td></tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
        {s.a > 0 && <button className="btn" onClick={onAgain}>{cfg.mode === "jour" ? "Continuer à s'entraîner" : "Rejouer"}</button>}
        {s.errors.length > 0 && <Link className="btn alt" href="/jouer?mode=erreurs">Réviser mes erreurs</Link>}
        <Link className="btn alt" href={back}>{backLabel}</Link>
      </div>
    );
  }

  const timerOn = !!cfg.timer;
  const barPct = timerOn ? (left / (cfg.timer as number)) * 100 : total0 ? ((total0 - remaining - (q ? 1 : 0) + (fb ? 1 : 0)) / total0) * 100 : 0;
  return (
    <>
      <div className="top">
        <span>{cfg.title}</span>
        <span aria-live="off">
          {timerOn ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : ""}
          {timerOn && (cfg.mode === "rush" || cfg.gen) ? " · " : ""}
          {cfg.mode === "rush" ? `${live.pts} pts` : cfg.gen || cfg.stopOnError ? `série ${live.c}` : !timerOn ? `${remaining + 1} restant${remaining ? "s" : ""}` : ""}
        </span>
      </div>
      <Bar pct={cfg.gen && !timerOn ? 100 : barPct} />
      <div className="box" key={qid}>
        {q?.type === "intro" ? (
          <>
            <p className="lab">{q.label}</p>
            <div className={`big ${q.prompt.length > 14 ? "s" : ""}`}>{q.prompt}</div>
            <p className="lab" style={{ fontSize: 20, color: "var(--tx)" }}>{q.reveal}</p>
            <button className="btn" onClick={intro} autoFocus>Compris, m&apos;interroger</button>
          </>
        ) : q ? (
          <>
            <QuestionView q={q} onResult={handle} keys={P.settings.keys} />
            <div aria-live="assertive">
              {fb && (
                <>
                  <p className={`fb ${fb.ok ? "ok" : "ko"}`}>
                    {fb.ok ? "Correct." : fb.good ? "Réponse : " + fb.good : "Voilà la correction."}
                    {fb.note && <span className="rule">{fb.note}</span>}
                  </p>
                  <button ref={nextRef} className="btn" onClick={advance}>{stop.current ? "Voir le bilan" : "Suivant"}</button>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="mu">Chargement…</p>
        )}
      </div>
      <p style={{ textAlign: "center" }}><Link href={back} className="note">Quitter la séance (Échap)</Link></p>
    </>
  );
}
