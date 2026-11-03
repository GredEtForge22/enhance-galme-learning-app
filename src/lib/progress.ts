import { C } from "@/data/galme";
import { day } from "./text";

export const IV = [0, 1, 2, 4, 8, 16];
export const THEMES = ["auto", "clair", "sombre", "aurore", "foret", "sepia", "contraste"] as const;

export type Card = { b: number; due: number; ok: number; ko: number; seen: number };
export type DayStat = { a: number; c: number; s: number; x: number };
export type Settings = {
  theme: string;
  goal: number;
  name: string;
  notif: boolean;
  notifTime: string;
  fontScale: number;
  keys: boolean;
  autoSync: boolean;
};
export type LessonState = { sec: string[]; quiz?: number; ex?: number; done?: boolean };
export type Progress = {
  v: 3;
  cards: Record<string, Card>;
  days: Record<string, DayStat>;
  cat: Record<string, { a: number; c: number }>;
  xp: number;
  sessions: number;
  perfect: number;
  sentOk: number;
  errs: Record<string, number>;
  fav: { words: number[]; texts: string[] };
  recent: number[];
  searches: string[];
  lessons: Record<string, LessonState>;
  exams: Record<string, { best: number; passed: boolean; n: number }>;
  texts: Record<string, { read?: boolean; best?: number }>;
  rec: { rush: Record<string, number>; survie: number; marathon: number; nofault: number; bestStreak: number; bestDay: number };
  badges: Record<string, number>;
  flags: Record<string, boolean>;
  daily: { d: number; done: boolean; score: number; bonus: number };
  resume: { lesson?: string };
  welcomed: boolean;
  created: number;
  modified: number;
  settings: Settings;
};

export const defaultSettings = (): Settings => ({
  theme: "auto",
  goal: 30,
  name: "",
  notif: false,
  notifTime: "18:00",
  fontScale: 100,
  keys: true,
  autoSync: true,
});

export const defaultProgress = (): Progress => ({
  v: 3,
  cards: {},
  days: {},
  cat: {},
  xp: 0,
  sessions: 0,
  perfect: 0,
  sentOk: 0,
  errs: {},
  fav: { words: [], texts: [] },
  recent: [],
  searches: [],
  lessons: {},
  exams: {},
  texts: {},
  rec: { rush: {}, survie: 0, marathon: 0, nofault: 0, bestStreak: 0, bestDay: 0 },
  badges: {},
  flags: {},
  daily: { d: -1, done: false, score: 0, bonus: -1 },
  resume: {},
  welcomed: false,
  created: day(),
  modified: 0,
  settings: defaultSettings(),
});

// ---------- validation défensive (import, restauration, synchronisation) ----------
type R = Record<string, unknown>;
const isObj = (x: unknown): x is R => typeof x === "object" && x !== null && !Array.isArray(x);
const num = (x: unknown, d = 0, lo = 0, hi = 1e9) =>
  typeof x === "number" && Number.isFinite(x) ? Math.min(hi, Math.max(lo, Math.round(x))) : d;
const str = (x: unknown, d = "", max = 60) => (typeof x === "string" ? x.slice(0, max) : d);
const entries = (x: unknown, max = 5000): [string, unknown][] => (isObj(x) ? Object.entries(x).slice(0, max) : []);
const safeKey = (k: string) => /^[a-zA-Z0-9_-]{1,40}$/.test(k);

export function sanitize(raw: unknown): Progress | null {
  if (!isObj(raw)) return null;
  const p = defaultProgress();
  const maxId = C.length - 1;
  for (const [k, v] of entries(raw.cards)) {
    if (!/^\d+$/.test(k) || +k > maxId || !isObj(v)) continue;
    p.cards[k] = { b: num(v.b, 0, 0, 5), due: num(v.due, 0, 0, 1e6), ok: num(v.ok), ko: num(v.ko), seen: num(v.seen, day(), 0, 1e6) };
  }
  for (const [k, v] of entries(raw.days, 20000)) {
    if (!/^\d+$/.test(k) || !isObj(v)) continue;
    p.days[k] = { a: num(v.a), c: num(v.c), s: num(v.s, 0, 0, 86400), x: num(v.x) };
  }
  for (const [k, v] of entries(raw.cat, 50)) {
    if (!isObj(v)) continue;
    p.cat[str(k, "", 40)] = { a: num(v.a), c: num(v.c) };
  }
  p.xp = num(raw.xp);
  p.sessions = num(raw.sessions);
  p.perfect = num(raw.perfect);
  p.sentOk = num(raw.sentOk);
  for (const [k, v] of entries(raw.errs)) if (/^\d+$/.test(k) && +k <= maxId) p.errs[k] = num(v, 1, 1, 999);
  if (isObj(raw.fav)) {
    p.fav.words = (Array.isArray(raw.fav.words) ? raw.fav.words : []).filter((x): x is number => typeof x === "number" && x >= 0 && x <= maxId).slice(0, 500);
    p.fav.texts = (Array.isArray(raw.fav.texts) ? raw.fav.texts : []).filter((x): x is string => typeof x === "string" && safeKey(x)).slice(0, 100);
  }
  p.recent = (Array.isArray(raw.recent) ? raw.recent : []).filter((x): x is number => typeof x === "number" && x >= 0 && x <= maxId).slice(0, 12);
  p.searches = (Array.isArray(raw.searches) ? raw.searches : []).filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 40)).slice(0, 10);
  for (const [k, v] of entries(raw.lessons, 100)) {
    if (!safeKey(k) || !isObj(v)) continue;
    p.lessons[k] = {
      sec: (Array.isArray(v.sec) ? v.sec : []).filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 20)).slice(0, 10),
      quiz: typeof v.quiz === "number" ? num(v.quiz, 0, 0, 100) : undefined,
      ex: typeof v.ex === "number" ? num(v.ex, 0, 0, 100) : undefined,
      done: v.done === true,
    };
  }
  for (const [k, v] of entries(raw.exams, 30)) {
    if (!safeKey(k) || !isObj(v)) continue;
    p.exams[k] = { best: num(v.best, 0, 0, 100), passed: v.passed === true, n: num(v.n) };
  }
  for (const [k, v] of entries(raw.texts, 100)) {
    if (!safeKey(k) || !isObj(v)) continue;
    p.texts[k] = { read: v.read === true, best: typeof v.best === "number" ? num(v.best, 0, 0, 100) : undefined };
  }
  if (isObj(raw.rec)) {
    for (const [k, v] of entries(raw.rec.rush, 10)) if (safeKey(k)) p.rec.rush[k] = num(v);
    p.rec.survie = num(raw.rec.survie);
    p.rec.marathon = num(raw.rec.marathon);
    p.rec.nofault = num(raw.rec.nofault);
    p.rec.bestStreak = num(raw.rec.bestStreak);
    p.rec.bestDay = num(raw.rec.bestDay);
  }
  for (const [k, v] of entries(raw.badges, 150)) if (safeKey(k)) p.badges[k] = num(v);
  for (const [k, v] of entries(raw.flags, 60)) if (safeKey(k)) p.flags[k] = v === true;
  if (isObj(raw.daily)) p.daily = { d: num(raw.daily.d, -1, -1), done: raw.daily.done === true, score: num(raw.daily.score, 0, 0, 100), bonus: num(raw.daily.bonus, -1, -1) };
  if (isObj(raw.resume) && typeof raw.resume.lesson === "string" && safeKey(raw.resume.lesson)) p.resume.lesson = raw.resume.lesson;
  p.welcomed = raw.welcomed === true;
  p.created = num(raw.created, day(), 0, 1e6);
  p.modified = num(raw.modified, 0, 0, 1e15);
  if (isObj(raw.settings)) {
    const s = raw.settings;
    p.settings = {
      theme: (THEMES as readonly string[]).includes(str(s.theme)) ? str(s.theme) : "auto",
      goal: num(s.goal, 30, 5, 500),
      name: str(s.name, "", 24).replace(/[<>]/g, ""),
      notif: s.notif === true,
      notifTime: /^\d{2}:\d{2}$/.test(str(s.notifTime)) ? str(s.notifTime) : "18:00",
      fontScale: num(s.fontScale, 100, 90, 140),
      keys: s.keys !== false,
      autoSync: s.autoSync !== false,
    };
  }
  return p;
}

/** Ancienne sauvegarde (index.html d'origine, clé « galme2 »). */
export function migrateV2(raw: unknown): Progress | null {
  if (!isObj(raw)) return null;
  const p = defaultProgress();
  const t = day();
  for (const [k, v] of entries(raw.c)) {
    if (!/^\d+$/.test(k) || +k >= C.length || !isObj(v)) continue;
    const b = num(v.b, 0, 0, 5);
    p.cards[k] = { b, due: num(v.due, t, 0, 1e6), ok: b, ko: 0, seen: t };
  }
  for (const [k, v] of entries(raw.d, 20000)) {
    if (!/^\d+$/.test(k)) continue;
    const a = num(v);
    p.days[k] = { a, c: a, s: 0, x: a * 10 };
  }
  if (isObj(raw.m) && typeof raw.m.d === "number") {
    const k = String(Math.round(raw.m.d));
    p.days[k] = { ...(p.days[k] || { a: 0, c: 0, x: 0 }), s: num(raw.m.s, 0, 0, 86400) };
  }
  if (typeof raw.rb === "number") p.rec.rush.normal = num(raw.rb);
  p.xp = Object.values(p.days).reduce((s, d) => s + d.x, 0);
  p.welcomed = Object.keys(p.cards).length > 0;
  return p;
}

/** Fusion de deux progressions (synchronisation entre appareils, import fusionné). */
export function merge(a: Progress, b: Progress): Progress {
  const newer = a.modified >= b.modified ? a : b;
  const r: Progress = JSON.parse(JSON.stringify(newer));
  const ids = new Set([...Object.keys(a.cards), ...Object.keys(b.cards)]);
  r.cards = {};
  ids.forEach((k) => {
    const x = a.cards[k], y = b.cards[k];
    if (!x || !y) r.cards[k] = { ...(x || y) };
    else {
      const sx = x.ok + x.ko, sy = y.ok + y.ko;
      const w = sx !== sy ? (sx > sy ? x : y) : x.b >= y.b ? x : y;
      r.cards[k] = { ...w, ok: Math.max(x.ok, y.ok), ko: Math.max(x.ko, y.ko), seen: Math.min(x.seen, y.seen) };
    }
  });
  r.days = {};
  new Set([...Object.keys(a.days), ...Object.keys(b.days)]).forEach((k) => {
    const x = a.days[k], y = b.days[k];
    r.days[k] = !x || !y ? { ...(x || y) } : { a: Math.max(x.a, y.a), c: Math.max(x.c, y.c), s: Math.max(x.s, y.s), x: Math.max(x.x, y.x) };
  });
  r.cat = {};
  new Set([...Object.keys(a.cat), ...Object.keys(b.cat)]).forEach((k) => {
    const x = a.cat[k], y = b.cat[k];
    r.cat[k] = !x || !y ? { ...(x || y) } : x.a >= y.a ? { ...x } : { ...y };
  });
  r.xp = Math.max(a.xp, b.xp);
  r.sessions = Math.max(a.sessions, b.sessions);
  r.perfect = Math.max(a.perfect, b.perfect);
  r.sentOk = Math.max(a.sentOk, b.sentOk);
  r.fav = { words: [...new Set([...a.fav.words, ...b.fav.words])], texts: [...new Set([...a.fav.texts, ...b.fav.texts])] };
  r.lessons = {};
  new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)]).forEach((k) => {
    const x = a.lessons[k], y = b.lessons[k];
    if (!x || !y) r.lessons[k] = { ...(x || y) };
    else r.lessons[k] = { sec: [...new Set([...x.sec, ...y.sec])], quiz: Math.max(x.quiz ?? -1, y.quiz ?? -1) < 0 ? undefined : Math.max(x.quiz ?? 0, y.quiz ?? 0), ex: Math.max(x.ex ?? -1, y.ex ?? -1) < 0 ? undefined : Math.max(x.ex ?? 0, y.ex ?? 0), done: !!(x.done || y.done) };
  });
  r.exams = {};
  new Set([...Object.keys(a.exams), ...Object.keys(b.exams)]).forEach((k) => {
    const x = a.exams[k], y = b.exams[k];
    r.exams[k] = !x || !y ? { ...(x || y) } : { best: Math.max(x.best, y.best), passed: x.passed || y.passed, n: Math.max(x.n, y.n) };
  });
  r.texts = {};
  new Set([...Object.keys(a.texts), ...Object.keys(b.texts)]).forEach((k) => {
    const x = a.texts[k], y = b.texts[k];
    r.texts[k] = !x || !y ? { ...(x || y) } : { read: !!(x.read || y.read), best: Math.max(x.best ?? -1, y.best ?? -1) < 0 ? undefined : Math.max(x.best ?? 0, y.best ?? 0) };
  });
  const rush: Record<string, number> = {};
  new Set([...Object.keys(a.rec.rush), ...Object.keys(b.rec.rush)]).forEach((k) => (rush[k] = Math.max(a.rec.rush[k] ?? 0, b.rec.rush[k] ?? 0)));
  r.rec = {
    rush,
    survie: Math.max(a.rec.survie, b.rec.survie),
    marathon: Math.max(a.rec.marathon, b.rec.marathon),
    nofault: Math.max(a.rec.nofault, b.rec.nofault),
    bestStreak: Math.max(a.rec.bestStreak, b.rec.bestStreak),
    bestDay: Math.max(a.rec.bestDay, b.rec.bestDay),
  };
  r.badges = { ...b.badges };
  Object.entries(a.badges).forEach(([k, v]) => (r.badges[k] = r.badges[k] ? Math.min(r.badges[k], v) : v));
  r.flags = { ...b.flags };
  Object.entries(a.flags).forEach(([k, v]) => (r.flags[k] = r.flags[k] || v));
  r.welcomed = a.welcomed || b.welcomed;
  r.created = Math.min(a.created, b.created);
  r.modified = Math.max(a.modified, b.modified);
  return r;
}
