import { C, GRAMMAR, LESSONS, TEXTS, levelWords, lessonById, sentences, textById, words } from "@/data/galme";
import type { Progress } from "./progress";
import type { Item, Kind } from "./questions";
import { day, pick, seeded, shuf, weekStart } from "./text";
import { ORAL_EXERCISES } from "@/data/oral";

export type SessionCfg = {
  mode: string;
  title: string;
  items: Item[];
  gen?: () => Item[];
  timer?: number;
  stopOnError?: boolean;
  retry?: boolean;
  pass?: number;
  meta: Record<string, string>;
  empty?: string;
};

const MIX: Kind[] = ["qf", "fq", "type", "vf", "dictee", "cat", "gram", "ending", "particle", "correct", "cloze", "build", "compr", "tcloze", "qf", "fq", "type"];
const SENT_K = new Set<Kind>(["cloze", "build", "correct"]);
const FREE_K = new Set<Kind>(["gram", "ending", "particle", "cat"]);
const TEXT_K = new Set<Kind>(["compr", "tcloze", "ttrans"]);

export function itemFor(k: Kind, rnd: () => number = Math.random, pool?: { id: number; u: number }[]): Item {
  if (k === "compr-orale") {
    const oral =
      ORAL_EXERCISES.length > 0
        ? pick(ORAL_EXERCISES, rnd)
        : undefined;

    return oral
      ? { k, oralId: oral.id }
      : { k };
  }
  if (FREE_K.has(k)) return { k };
  if (TEXT_K.has(k)) return { k, textId: pick(TEXTS, rnd).id };
  if (SENT_K.has(k)) {
    const src = (pool ?? []).filter((e) => e.u === 5);
    return { k, id: pick(src.length ? src : sentences, rnd).id };
  }
  const src = pool && pool.length ? pool : rnd() < 0.3 ? sentences : words;
  return { k, id: pick(src, rnd).id };
}
export const randomItem = (rnd: () => number = Math.random): Item => itemFor(pick(MIX, rnd), rnd);

const many = (n: number, f: (i: number) => Item) => Array.from({ length: n }, (_, i) => f(i));
const rep = (k: Kind, n: number, pool?: { id: number; u: number }[]) => many(n, () => itemFor(k, Math.random, pool));

export function buildSession(mode: string, sp: URLSearchParams, P: Progress): SessionCfg | null {
  const t = day();
  const base = (title: string, items: Item[], extra: Partial<SessionCfg> = {}): SessionCfg => ({ mode, title, items, retry: false, meta: {}, ...extra });
  const rnd = Math.random;
  switch (mode) {
    case "jour": {
      const due = shuf(C.filter((c) => P.cards[c.id] && P.cards[c.id].due <= t)).slice(0, 15).map((c): Item => ({ id: c.id }));
      const order = LESSONS.flatMap((l) => l.ids);
      const nw = order.filter((id) => !P.cards[id]).slice(0, 6).map((id): Item => ({ id, intro: true }));
      const items = [...due, ...nw];
      if (items.length) {
        items.splice(Math.min(items.length, 7), 0, { k: "match" });
        items.push({ k: "match" });
      }
      return base("Séance du jour", items, { retry: true, empty: "Tout est à jour : aucun mot à réviser ni à découvrir pour l'instant. Reviens demain, ou continue avec un autre mode." });
    }
    case "erreurs": {
      const ids = Object.keys(P.errs).map(Number).sort((a, b) => P.errs[b] - P.errs[a]).slice(0, 20);
      return base("Révision des erreurs", shuf(ids).map((id): Item => ({ id })), { retry: true, empty: "Aucune erreur à réviser pour le moment. Bravo !" });
    }
    case "intensif": {
      const ids = C.filter((c) => P.cards[c.id] && (P.cards[c.id].b < 2 || P.cards[c.id].ko > P.cards[c.id].ok))
        .sort((a, b) => P.cards[b.id].ko - P.cards[b.id].ok - (P.cards[a.id].ko - P.cards[a.id].ok)).slice(0, 15);
      const ks: Kind[] = ["qf", "type", "fq", "vf"];
      return base("Révision intensive", shuf(ids).map((c, i): Item => ({ id: c.id, k: c.u === 5 ? (i % 2 ? "build" : "qf") : ks[i % ks.length] })), { retry: true, empty: "Aucun mot difficile pour l'instant : continue d'apprendre, puis reviens ici." });
    }
    case "perso": {
      const cat = sp.get("cat") || "all";
      const n = Math.min(40, Math.max(5, +(sp.get("n") || 15)));
      const ks = (sp.get("k") || "qf,fq,type").split(",").filter(Boolean) as Kind[];
      const pool = C.filter((c) => cat === "all" || (cat === "Phrase" ? c.u === 5 : c.t === cat));
      const kinds = ks.length ? ks : (["qf"] as Kind[]);
      return base("Entraînement personnalisé", many(n, (i) => itemFor(kinds[i % kinds.length], rnd, pool)), { retry: true });
    }
    case "lecon": {
      const l = lessonById(sp.get("lesson") || "");
      if (!l) return null;
      const es = shuf(l.ids).map((id) => C[id]);
      const wk: Kind[] = ["qf", "fq", "vf", "type"], sk: Kind[] = ["qf", "build", "cloze", "correct"];
      const items = es.slice(0, 14).map((c, i): Item => ({ id: c.id, k: c.u === 5 ? sk[i % 4] : wk[i % 4] }));
      shuf(GRAMMAR.map((g, gi) => ({ g, gi })).filter((x) => x.g.u.includes(l.unit))).slice(0, 2).forEach((x) => items.splice(Math.floor(Math.random() * items.length), 0, { k: "gram", gi: x.gi }));
      return base(`Exercices · ${l.title}`, items, { retry: true, pass: 70, meta: { lesson: l.id } });
    }
    case "quiz": {
      const l = lessonById(sp.get("lesson") || "");
      if (!l) return null;
      const es = shuf(l.ids).map((c) => C[c]);
      const items: Item[] = es.slice(0, 4).map((c, i) => ({ id: c.id, k: (["qf", "fq", "vf", "qf"] as Kind[])[i] }));
      const g = shuf(GRAMMAR.map((x, gi) => ({ x, gi })).filter((y) => y.x.u.includes(l.unit))).slice(0, 2);
      g.forEach((y) => items.push({ k: "gram", gi: y.gi }));
      if (!g.length) items.push({ k: "cat" }, { k: "ending" });
      return base(`Quiz de compréhension · ${l.title}`, items, { pass: 60, meta: { lesson: l.id } });
    }
    case "examen-niveau": {
      const n = +(sp.get("niveau") || 1);
      const L = levelWords(n);
      if (!L.length) return null;
      const items = shuf(L).slice(0, 20).map((c): Item => {
        const ks: Kind[] = c.u === 5 ? ["qf", "fq", "type", "build", "cloze", "correct"] : ["qf", "fq", "type", "vf", "qf", "fq"];
        return { id: c.id, k: pick(ks) };
      });
      GRAMMAR.map((g, gi) => ({ g, gi })).filter((x) => LEVELS_UNITS(n).some((u) => x.g.u.includes(u))).slice(0, 3).forEach((x) => items.push({ k: "gram", gi: x.gi }));
      return base(`Examen · niveau ${n}`, shuf(items).slice(0, 22), { timer: 660, pass: 80, meta: { level: String(n) } });
    }
    case "examen":
      return base("Examen chronométré", many(20, () => randomItem(rnd)), { timer: 600, pass: 80, meta: { level: "g" } });
    case "dictee": return base("Dictée en galme", many(12, (i) => itemFor("dictee", rnd, i % 2 ? sentences : words)), { retry: true });
    case "tr-fg": return base("Traduction français → galme", many(12, (i) => itemFor("type", rnd, i % 2 ? sentences : words)), { retry: true });
    case "tr-gf": return base("Traduction galme → français", many(12, (i) => itemFor("qf", rnd, i % 2 ? sentences : words)), { retry: true });
    case "inverse": return base("Traduction inversée", many(16, (i) => itemFor((["qf", "type", "fq", "type"] as Kind[])[i % 4], rnd, i % 3 === 0 ? sentences : words)), { retry: true });
    case "compr": return base("Compréhension écrite", shuf(TEXTS).slice(0, 4).flatMap((x) => [itemFor("compr", rnd), { k: "compr" as Kind, textId: x.id }]));
    case "compr-orale": {
      const items = shuf(ORAL_EXERCISES)
        .slice(0, 10)
        .map((oral): Item => ({
          k: "compr-orale",
          oralId: oral.id,
        }));

      return base("Compréhension orale", items, {
        empty:
          "Aucun exercice audio n'est configuré. Ajoute un exercice dans src/data/oral.ts et son fichier dans public/audio/galme/.",
      });
    }
    case "tcloze": return base("Textes à trous", shuf(TEXTS).slice(0, 3).map((x): Item => ({ k: "tcloze", textId: x.id })));
    case "ttrans": return base("Traduction de textes entiers", shuf(TEXTS.filter((x) => x.kind === "phrases")).slice(0, 2).map((x): Item => ({ k: "ttrans", textId: x.id })));
    case "ordre": return base("Phrases à remettre dans l'ordre", rep("build", 10), { retry: true });
    case "gram": return base("Questions de grammaire", shuf(GRAMMAR.map((_, gi): Item => ({ k: "gram", gi }))).slice(0, 12));
    case "ending": return base("Exercices sur les terminaisons", rep("ending", 10));
    case "particle": return base("Exercices sur les particules", rep("particle", 10));
    case "cat": return base("Reconnaissance des catégories", rep("cat", 12));
    case "correct": return base("Correction de phrases", rep("correct", 10));
    case "flip": return base("Cartes à retourner", shuf(words).slice(0, 12).map((c): Item => ({ id: c.id, k: "flip" })), { retry: true });
    case "rush": {
      const d = sp.get("diff") || "normal";
      const timer = d === "facile" ? 90 : d === "difficile" ? 45 : 60;
      const gen = () =>
        many(10, (i): Item => {
          if (d === "facile") return { id: pick(words).id, k: i % 2 ? "qf" : "fq" };
          if (d === "difficile") return itemFor((["type", "fq", "qf", "cloze", "vf"] as Kind[])[i % 5], rnd, i % 3 === 0 ? sentences : words);
          return { id: pick(words).id, k: (["qf", "fq", "vf"] as Kind[])[i % 3] };
        });
      return base(`Contre la montre · ${d}`, [], { gen, timer, meta: { diff: d } });
    }
    case "survie": return base("Mode survie", [], { gen: () => many(10, () => randomItem(rnd)), stopOnError: true });
    case "marathon": return base("Mode marathon", many(40, () => randomItem(rnd)));
    case "sansfaute": return base("Mode sans faute", many(15, () => randomItem(rnd)), { stopOnError: true });
    case "aleatoire": return base("Mode aléatoire", many(20, () => randomItem(rnd)), { retry: true });
    case "defi": {
      const r = seeded(t * 7919 + 13);
      return base("Défi quotidien", many(10, () => randomItem(r)), { meta: { daily: String(t) } });
    }
    case "defi-semaine": {
      const w = weekStart(t);
      const r = seeded(w * 104729 + 7);
      return base("Défi communautaire de la semaine", many(15, () => randomItem(r)), { meta: { week: String(w) } });
    }
    case "mot": {
      const id = +(sp.get("id") || -1);
      const c = C[id];
      if (!c) return null;
      const ks: Kind[] = c.u === 5 ? ["qf", "fq", "build", "cloze", "type", "correct"] : ["qf", "fq", "vf", "type", "dictee", "flip"];
      return base(`Réviser « ${c.g} »`, ks.map((k): Item => ({ id: c.id, k })), { retry: true });
    }
    case "texte": {
      const x = textById(sp.get("text") || "");
      if (!x) return null;
      const sub = sp.get("sub") || "all";
      const items: Item[] = [];
      if (sub === "all" || sub === "compr") items.push(...many(3, (): Item => ({ k: "compr", textId: x.id })));
      if (sub === "all" || sub === "tcloze") items.push({ k: "tcloze", textId: x.id });
      if (sub === "all" || sub === "ttrans") items.push({ k: "ttrans", textId: x.id });
      return base(`Exercices · ${x.title}`, items, { meta: { text: x.id } });
    }
    default:
      return null;
  }
}

function LEVELS_UNITS(n: number): number[] {
  const m: Record<number, number[]> = { 1: [0, 3], 2: [1], 3: [2], 4: [4], 5: [5] };
  return m[n] || [];
}
