import {
  AFFIX_TOKENS, AFF_LABEL, C, CATS, Entry, GRAMMAR, ORAL, TEXTS, U, VPAIRS, analyze, clean, heads, punct,
  sentences, textById, tokens, variantsOf, words,
} from "@/data/galme";
import type { Progress } from "./progress";
import { norm, pick, shuf } from "./text";

export type Kind =
  | "qf" | "fq" | "type" | "build" | "cloze" | "vf" | "flip" | "match" | "dictee" | "gram" | "ending"
  | "particle" | "cat" | "correct" | "compr" | "tcloze" | "ttrans";

export type Item = { k?: Kind; id?: number; textId?: string; gi?: number; intro?: boolean; w?: boolean; n?: number };
export type Opt = { key: string; text: string };
type Base = { label: string; cat: string; wordId?: number; sent?: boolean };
export type Part = { s: string } | { g: number; p: string };
export type Question = Base &
  (
    | { type: "choice"; prompt: string; sub?: string; ctx?: string[]; opts: Opt[]; answer: string; good: string; note?: string }
    | { type: "typed"; prompt: string; answers: string[]; good: string; flash?: { text: string; ms: number } }
    | { type: "order"; prompt: string; tokens: string[]; good: string }
    | { type: "flip"; prompt: string; reveal: string }
    | { type: "match"; pairs: { id: number; g: string; f: string }[] }
    | { type: "gaps"; lines: { parts: Part[]; fr: string }[]; bank: string[]; answers: string[]; good: string }
    | { type: "multi"; rows: { fr: string; g: string }[]; good: string }
    | { type: "intro"; prompt: string; reveal: string }
  );

type ChoiceQ = Extract<Question, { type: "choice" }>;

export function kindFor(c: Entry, b: number): Kind {
  const s = c.u === 5, r = Math.random();
  if (s) return b < 1 ? "qf" : b < 2 ? (r < 0.5 ? "build" : "cloze") : r < 0.34 ? "fq" : r < 0.67 ? "build" : "cloze";
  return b < 1 ? "qf" : b < 2 ? (r < 0.5 ? "qf" : "vf") : b < 4 ? (r < 0.4 ? "fq" : r < 0.7 ? "vf" : "type") : r < 0.6 ? "type" : "fq";
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function choiceWord(c: Entry, dir: boolean, pool: Entry[], label?: string): ChoiceQ {
  const seen = new Set([dir ? c.g : c.f]);
  const opts: Entry[] = [c];
  for (const x of shuf(pool.filter((x) => x.id !== c.id))) {
    const k = dir ? x.g : x.f;
    if (!seen.has(k)) {
      seen.add(k);
      opts.push(x);
    }
    if (opts.length === 4) break;
  }
  return {
    type: "choice", label: label ?? (dir ? "Comment dit-on en galme ?" : "Que veut dire…"),
    prompt: dir ? c.f : c.g, opts: shuf(opts).map((o) => ({ key: String(o.id), text: dir ? o.g : o.f })),
    answer: String(c.id), good: dir ? c.g : c.f, wordId: c.id, cat: c.t, sent: c.u === 5,
  };
}

const textChoice = (prompt: string, sub: string | undefined, label: string, cat: string, good: string, wrong: string[]): ChoiceQ => ({
  type: "choice", label, cat, prompt, sub, good, answer: good,
  opts: shuf([good, ...wrong]).map((t) => ({ key: t, text: t })),
});

function qEnding(): Question {
  const suf = AFFIX_TOKENS.filter((a) => a.aff.startsWith("-"));
  if (Math.random() < 0.5 || !suf.length) {
    const [a, b] = pick(VPAIRS);
    const forbid = new Set([a, b, ...VPAIRS.filter((p) => p[0] === a).map((p) => p[1])].map((x) => x.toLowerCase()));
    const pool = words.map((w) => heads(w.g)[0]).filter((h) => !forbid.has(h.toLowerCase()) && h.length > 2 && !/[ -]/.test(h));
    const ds = shuf([...new Set(pool)]).slice(0, 3);
    const q = textChoice(`Quelle forme a le même sens que « ${a} » ?`, undefined, "Terminaisons et variantes", "Terminaisons", b, ds);
    return { ...q, good: b + (ORAL.has(b) ? " (à l'oral)" : ""), note: "Un mot peut changer de terminaison sans changer de sens." };
  }
  const x = pick(suf);
  const labels = [...new Set(Object.values(AFF_LABEL))];
  const good = AFF_LABEL[x.aff];
  const q = textChoice(`Que marque l'élément « ${x.aff} » dans « ${x.tok} » ?`, x.fr ? `${x.base} = ${x.fr}` : undefined, "Terminaisons et variantes", "Terminaisons", cap(good), shuf(labels.filter((l) => l !== good)).slice(0, 3).map(cap));
  return q;
}

function qParticle(): Question {
  const r = Math.random();
  const u1 = C.filter((c) => c.u === 1);
  if (r < 0.3) {
    const c = pick(u1);
    return { ...choiceWord(c, Math.random() < 0.5, u1, "Particules · choisis la bonne réponse"), cat: "Particules" };
  }
  if (r < 0.6) {
    const pre = AFFIX_TOKENS.filter((a) => !a.aff.startsWith("-"));
    if (pre.length) {
      const x = pick(pre);
      const labels = [...new Set(Object.values(AFF_LABEL))];
      const good = AFF_LABEL[x.aff];
      return textChoice(`Que marque l'élément « ${x.aff} » dans « ${x.tok} » ?`, x.fr ? `${x.base} = ${x.fr}` : undefined, "Particules", "Particules", cap(good), shuf(labels.filter((l) => l !== good)).slice(0, 3).map(cap));
    }
  }
  const cand = sentences.flatMap((s) =>
    tokens(s.g).map((t, i) => ({ s, i, t })).filter((x) => {
      const a = analyze(x.t);
      return x.t !== "?" && a.entry && a.entry.u === 1 && a.aff.length === 0 && !/[ ()-]/.test(a.entry.g);
    }),
  );
  if (!cand.length) return { ...choiceWord(pick(u1), true, u1), cat: "Particules" };
  const c = pick(cand);
  const T = tokens(c.s.g);
  const good = clean(c.t);
  const ds = shuf(u1.map((e) => e.g).filter((g) => !/[ ()-]/.test(g) && norm(g) !== norm(good))).slice(0, 3);
  return textChoice(T.map((t, j) => (j === c.i ? "____" + punct(t) : t)).join(" "), c.s.f, "Complète avec la bonne particule", "Particules", good, ds);
}

function qCat(): Question {
  const c = pick(words.filter((w) => CATS.includes(w.t)));
  return textChoice(c.g, `« ${c.f} »`, "Quelle est la catégorie grammaticale ?", "Catégories", c.t, shuf(CATS.filter((t) => t !== c.t)).slice(0, 3));
}

function qCorrect(): Question {
  const c = pick(sentences.filter((s) => tokens(s.g).length >= 3));
  const T = tokens(c.g);
  const set = new Set([c.g]);
  for (let i = 0; i < 40 && set.size < 3; i++) set.add(shuf(T).join(" "));
  return { ...textChoice(c.f, undefined, "Quelle est la phrase correcte en galme ?", "Correction", c.g, [...set].filter((x) => x !== c.g)), wordId: c.id, sent: true };
}

function qGram(it: Item): Question {
  const g = it.gi !== undefined ? GRAMMAR[it.gi % GRAMMAR.length] : pick(GRAMMAR);
  const good = g.opts[0];
  return { ...textChoice(g.q, undefined, "Grammaire", "Grammaire", good, g.opts.slice(1)), note: g.rule };
}

function lines(textId?: string) {
  const t = (textId && textById(textId)) || pick(TEXTS);
  return { t, L: t.lines.map((i) => C[i]) };
}

function qCompr(it: Item): Question {
  const { t, L } = lines(it.textId);
  const e = it.id !== undefined && L.some((l) => l.id === it.id) ? C[it.id] : pick(L);
  const pad = C.filter((c) => c.u === e.u && !L.some((l) => l.id === c.id));
  const q = choiceWord(e, Math.random() < 0.5, [...L, ...shuf(pad)], `Compréhension écrite · ${t.title}`);
  return { ...q, ctx: L.map((l) => l.g), cat: "Compréhension" };
}

function qTcloze(it: Item): Question {
  const { t, L } = lines(it.textId);
  const cand: { li: number; ti: number; w: string }[] = [];
  L.forEach((l, li) => tokens(l.g).forEach((tok, ti) => { if (norm(clean(tok)).length > 2) cand.push({ li, ti, w: clean(tok) }); }));
  const chosen: typeof cand = [];
  for (const c of shuf(cand)) {
    if (chosen.length < 4 && !chosen.some((x) => norm(x.w) === norm(c.w))) chosen.push(c);
  }
  const ws = chosen.map((c) => c.w);
  const ds = shuf(words.map((w) => clean(w.g.split(" ")[0])).filter((x) => norm(x).length > 2 && !ws.some((w) => norm(w) === norm(x)))).slice(0, 2);
  return {
    type: "gaps", label: `Texte à trous · ${t.title}`, cat: "Textes à trous", bank: shuf([...new Set([...ws, ...ds])]), answers: ws, good: ws.join(", "),
    lines: L.map((l, li) => ({
      fr: l.f,
      parts: tokens(l.g).map((tok, ti): Part => {
        const gi = chosen.findIndex((c) => c.li === li && c.ti === ti);
        return gi >= 0 ? { g: gi, p: punct(tok) } : { s: tok };
      }),
    })),
  };
}

function qTtrans(it: Item): Question {
  const { t, L } = lines(it.textId);
  return { type: "multi", label: `Traduis le texte entier · ${t.title}`, cat: "Traduction de textes", rows: L.map((l) => ({ fr: l.f, g: l.g })), good: L.map((l) => l.g).join(" / ") };
}

export function makeQuestion(it: Item, P: Progress): Question | null {
  const c = it.id !== undefined ? C[it.id] : undefined;
  if (it.intro && c) return { type: "intro", label: "Nouveau mot · " + U[c.u], cat: c.t, wordId: c.id, prompt: c.g, reveal: c.f };
  const k: Kind = it.k ?? (c ? kindFor(c, P.cards[c.id]?.b ?? 0) : "qf");
  const w = c ?? pick(words);
  const sent = w.u === 5;
  const poolFor = (x: Entry) => C.filter((y) => y.id !== x.id && (y.u === 5) === (x.u === 5));
  switch (k) {
    case "qf": return choiceWord(w, false, poolFor(w));
    case "fq": return choiceWord(w, true, poolFor(w));
    case "type":
      return {
        type: "typed",
        label: "Écris en galme",
        prompt: w.f,
        answers: [
          ...new Set([
            w.g,
            ...heads(w.g),
            ...variantsOf(w),
          ]),
        ],
        good: w.g,
        wordId: w.id,
        cat: w.t,
        sent,
      };
    case "dictee":
      return {
        type: "typed", label: "Dictée : mémorise, puis écris en galme", prompt: w.f, answers: [w.g, ...heads(w.g)], good: w.g, wordId: w.id, cat: "Dictée", sent,
        flash: { text: w.g, ms: sent ? Math.min(9000, 2500 + tokens(w.g).length * 700) : 2500 },
      };
    case "build": {
      const s = sent ? w : pick(sentences);
      return { type: "order", label: "Remets la phrase en galme dans l'ordre", prompt: s.f, tokens: tokens(s.g), good: s.g, wordId: s.id, cat: s.t, sent: true };
    }
    case "cloze": {
      const s = sent ? w : pick(sentences);
      const T = tokens(s.g);
      const ix = T.map((t, i) => i).filter((i) => norm(T[i]).length > 2);
      const i = pick(ix);
      const good = clean(T[i]);
      const ds = [...new Set(shuf(words.map((x) => clean(x.g.split(" ")[0]))).filter((x) => norm(x) !== norm(good) && norm(x).length > 2))].slice(0, 3);
      const q = textChoice(T.map((t, j) => (j === i ? "____" + punct(t) : t)).join(" "), s.f, "Complète la phrase", s.t, good, ds);
      return { ...q, wordId: s.id, sent: true, good: s.g };
    }
    case "vf": {
      const t = Math.random() < 0.5;
      const o = shuf(C.filter((x) => x.id !== w.id && x.u === w.u && x.f !== w.f))[0] || w;
      return {
        type: "choice", label: "Vrai ou faux ?", prompt: w.g, sub: `= ${t ? w.f : o.f} ?`,
        opts: [{ key: "1", text: "Vrai" }, { key: "0", text: "Faux" }], answer: t ? "1" : "0", good: `${w.g} = ${w.f}`, wordId: w.id, cat: w.t, sent,
      };
    }
    case "flip": {
      const d = Math.random() < 0.5;
      return { type: "flip", label: d ? "Comment dit-on en galme ?" : "Que veut dire…", prompt: d ? w.f : w.g, reveal: d ? w.g : w.f, wordId: w.id, cat: w.t, sent };
    }
    case "match": {
      const pool = words.filter((x) => P.cards[x.id]);
      if (pool.length < 4) return null;
      return { type: "match", label: "Associe chaque mot à sa traduction", cat: "Vocabulaire", pairs: shuf(pool).slice(0, 5).map((x) => ({ id: x.id, g: x.g, f: x.f })) };
    }
    case "gram": return qGram(it);
    case "ending": return qEnding();
    case "particle": return qParticle();
    case "cat": return qCat();
    case "correct": return qCorrect();
    case "compr": return qCompr(it);
    case "tcloze": return qTcloze(it);
    case "ttrans": return qTtrans(it);
  }
}

export const KIND_LABEL: Record<Kind, string> = {
  qf: "Galme → français (choix)", fq: "Français → galme (choix)", type: "Traduction écrite", build: "Phrase à remettre dans l'ordre",
  cloze: "Phrase à compléter", vf: "Vrai ou faux", flip: "Cartes à retourner", match: "Associer", dictee: "Dictée", gram: "Grammaire",
  ending: "Terminaisons", particle: "Particules", cat: "Catégories grammaticales", correct: "Correction de phrases",
  compr: "Compréhension écrite", tcloze: "Texte à trous", ttrans: "Traduction de texte",
};
