import { C, LEVELS, LESSONS, TO } from "@/data/galme";
import type { Progress } from "./progress";
import { day, dayDate, weekStart } from "./text";

export type Status = "new" | "seen" | "learning" | "mastered";
export const STATUS_LABEL: Record<Status, string> = { new: "Non vu", seen: "Découvert", learning: "En cours", mastered: "Maîtrisé" };

export const statusOf = (p: Progress, id: number): Status => {
  const c = p.cards[id];
  if (!c) return "new";
  if (c.b >= 4) return "mastered";
  if (c.b >= 1) return "learning";
  return "seen";
};

export function counts(p: Progress) {
  const r = { new: 0, seen: 0, learning: 0, mastered: 0 };
  C.forEach((c) => r[statusOf(p, c.id)]++);
  return r;
}

export const masteredIn = (p: Progress, ids: number[]) => ids.filter((i) => p.cards[i] && p.cards[i].b >= 4).length;
export const masteredSentences = (p: Progress) => C.filter((c) => c.u === 5 && p.cards[c.id]?.b >= 4).length;
export const masteredWords = (p: Progress) => C.filter((c) => c.u < 5 && p.cards[c.id]?.b >= 4).length;
export const learnedWords = (p: Progress) => C.filter((c) => c.u < 5 && p.cards[c.id]?.b >= 1).length;
export const masteryPct = (p: Progress) => Math.round((C.filter((c) => p.cards[c.id]?.b >= 4).length / C.length) * 100);

export function streak(p: Progress): number {
  let n = 0;
  let d = day();
  if (!(p.days[d]?.a > 0)) d--;
  while (p.days[d]?.a > 0) {
    n++;
    d--;
  }
  return n;
}

export function bestStreak(p: Progress): number {
  const ks = Object.keys(p.days).map(Number).filter((k) => p.days[k].a > 0).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -9;
  for (const k of ks) {
    run = k === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return Math.max(best, p.rec.bestStreak);
}

export const totalSecs = (p: Progress) => Object.values(p.days).reduce((s, d) => s + d.s, 0);
export const totalAnswers = (p: Progress) => Object.values(p.days).reduce((s, d) => s + d.a, 0);
export const totalCorrect = (p: Progress) => Object.values(p.days).reduce((s, d) => s + d.c, 0);
export const successRate = (p: Progress) => {
  const a = totalAnswers(p);
  return a ? Math.round((totalCorrect(p) / a) * 100) : 0;
};

export function sumDays(p: Progress, from: number, to: number) {
  const r = { a: 0, c: 0, s: 0, x: 0 };
  for (let d = from; d <= to; d++) {
    const x = p.days[d];
    if (x) {
      r.a += x.a;
      r.c += x.c;
      r.s += x.s;
      r.x += x.x;
    }
  }
  return r;
}

export function weekly(p: Progress, n = 8) {
  const w0 = weekStart(day());
  return Array.from({ length: n }, (_, i) => {
    const s = w0 - (n - 1 - i) * 7;
    const d = dayDate(s);
    return { label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, ...sumDays(p, s, s + 6) };
  });
}

export function monthly(p: Progress, n = 6) {
  const now = dayDate(day());
  return Array.from({ length: n }, (_, i) => {
    const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    const nx = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    const a = Math.floor(m.getTime() / 864e5), b = Math.floor(nx.getTime() / 864e5) - 1;
    return { label: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"][m.getUTCMonth()], ...sumDays(p, a, b) };
  });
}

export function categoryStats(p: Progress) {
  return TO.map((t) => {
    const ids = C.filter((c) => c.t === t).map((c) => c.id);
    const st = p.cat[t] || { a: 0, c: 0 };
    return { t, total: ids.length, mastered: masteredIn(p, ids), pct: ids.length ? Math.round((masteredIn(p, ids) / ids.length) * 100) : 0, acc: st.a ? Math.round((st.c / st.a) * 100) : -1, a: st.a };
  }).filter((x) => x.total > 0);
}

export function lessonProgress(p: Progress, id: string) {
  const l = p.lessons[id];
  return l ? Math.round((l.sec.length / 5) * 100) : 0;
}
export const lessonsDone = (p: Progress) => LESSONS.filter((l) => p.lessons[l.id]?.done).length;
export const levelLessons = (n: number) => LESSONS.filter((l) => l.level === n);
export const levelDone = (p: Progress, n: number) => levelLessons(n).filter((l) => p.lessons[l.id]?.done).length;
export const overallPct = (p: Progress) => {
  const total = LESSONS.length + LEVELS.length;
  const done = lessonsDone(p) + LEVELS.filter((l) => p.exams["n" + l.n]?.passed).length;
  return Math.round((done / total) * 100);
};

// ---------- XP & niveaux d'apprenant ----------
const XP_STEPS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 6000];
const XP_NAMES = ["Curieux", "Apprenti", "Initié", "Habitué", "Familier", "Confirmé", "Expert", "Érudit", "Maître", "Sage"];
export function levelOf(xp: number) {
  let i = 0;
  while (i + 1 < XP_STEPS.length && xp >= XP_STEPS[i + 1]) i++;
  const over = xp >= XP_STEPS[XP_STEPS.length - 1];
  const base = over ? XP_STEPS[XP_STEPS.length - 1] + Math.floor((xp - XP_STEPS[XP_STEPS.length - 1]) / 2000) * 2000 : XP_STEPS[i];
  const next = over ? base + 2000 : XP_STEPS[i + 1];
  const n = over ? XP_STEPS.length + Math.floor((xp - XP_STEPS[XP_STEPS.length - 1]) / 2000) : i + 1;
  return { n, name: over ? "Sage" : XP_NAMES[i], base, next, pct: Math.round(((xp - base) / (next - base)) * 100) };
}
