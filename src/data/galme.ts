// Couche d'accès aux données linguistiques. Aucune règle ni aucun mot n'est ajouté ici :
// tout est dérivé de galme-source.ts (corpus d'origine). Les « leçons », « niveaux » et « textes »
// ne sont que des regroupements des mots et phrases déjà existants.
import { U, NOTES, PRON, RAW, TX, TD, TO, TT } from "./galme-source";

export { U, NOTES, PRON, TO, TT };

export type Entry = { id: number; g: string; f: string; u: number; t: string };

export const C: Entry[] = RAW.split("\n")
  .filter((l) => l.trim().length > 0)
  .map((l, i) => {
    const p = l.split("|");
    return { id: i, g: p[0], f: p[1], u: +p[2], t: TX[p[0]] || TD[+p[2]] };
  });

export const byId = (id: number): Entry | undefined => C[id];
export const words = C.filter((c) => c.u < 5);
export const sentences = C.filter((c) => c.u === 5);
export const CATS = ["Pronom", "Verbe", "Nom", "Adjectif", "Adverbe", "Particule", "Expression"];

export const tokens = (g: string) => g.split(/\s+/).filter(Boolean);
export const clean = (t: string) => t.replace(/[,?!.;:]+$/, "");
export const punct = (t: string) => t.slice(clean(t).length);

/** « kanora (kenara) » -> ["kanora","kenara"] ; « -vo (ou ve-) » -> ["-vo","ve-"] */
export function heads(g: string): string[] {
  const m = g.match(/^(.*?)\s*\((?:ou\s+)?(.*?)\)$/);
  return m ? [m[1], m[2]] : [g];
}

const HEAD = new Map<string, Entry>();
C.forEach((e) => {
  if (e.u === 5) return;
  for (const h of heads(e.g)) {
    const k = h.toLowerCase();
    if (!HEAD.has(k)) HEAD.set(k, e);
  }
});

export const AFF_LABEL: Record<string, string> = {
  "pre-": "passé",
  "fu-": "futur",
  "ve-": "conditionnel",
  "-vo": "conditionnel",
  "-ko": "question",
  "-sha": "le contraire",
};

/** Décompose un mot d'une phrase : racine, entrée du dictionnaire, affixes (pre-, fu-, -ko, -sha, -vo, ve-). */
export function analyze(tok: string): { base: string; entry: Entry | null; aff: string[] } {
  const t = clean(tok).toLowerCase();
  const aff: string[] = [];
  let b = t;
  for (let guard = 0; guard < 4; guard++) {
    const m = b.match(/^(pre|fu|ve)-(.+)$/);
    if (m && !HEAD.has(b)) {
      aff.push(m[1] + "-");
      b = m[2];
      continue;
    }
    const s = b.match(/^(.+)-(sha|ko|vo)$/);
    if (s && !HEAD.has(b)) {
      aff.push("-" + s[2]);
      b = s[1];
      continue;
    }
    break;
  }
  return { base: b, entry: HEAD.get(b) || null, aff };
}

/** Phrases du corpus qui contiennent l'entrée donnée. */
export function examplesOf(e: Entry): Entry[] {
  if (e.u === 5) return [];
  const hs = heads(e.g).map((h) => h.toLowerCase());
  return sentences.filter((s) => {
    const low = s.g.toLowerCase();
    return (
      hs.some((h) => h.includes(" ") && low.includes(h)) ||
      tokens(s.g).some((tok) => {
        const a = analyze(tok);
        return a.entry?.id === e.id || hs.some((h) => a.aff.includes(h));
      })
    );
  });
}

export const VARIANTS: Record<string, string[]> = {
  ena: ["e- (à l'oral)"],
  sivo: ["siva"],
  funizi: ["funiza", "funizo", "funizu"],
  daroke: ["droké (à l'oral)"],
  kanora: ["kenara"],
  "-vo": ["ve-"],
};

export function variantsOf(e: Entry): string[] {
  if (e.u === 5) return [];

  const out = new Set<string>();

  for (const h of heads(e.g)) {
    for (const variant of VARIANTS[h.toLowerCase()] ?? []) {
      // Retire les précisions comme « (à l'oral) »
      const cleanVariant = variant
        .replace(/\s*\([^)]*\)\s*$/, "")
        .trim();

      if (cleanVariant) out.add(cleanVariant);
    }
  }

  return [...out];
}

/** Formes déjà répertoriées : variantes déclarées + formes rencontrées dans les phrases du corpus. */
export function formsOf(e: Entry): string[] {
  if (e.u === 5) return [];
  const out = new Set<string>();
  for (const h of heads(e.g)) for (const v of VARIANTS[h.toLowerCase()] || []) out.add(v);
  const hs = heads(e.g).map((h) => h.toLowerCase());
  sentences.forEach((s) =>
    tokens(s.g).forEach((tok) => {
      const a = analyze(tok);
      const c = clean(tok);
      if (a.entry?.id === e.id && !hs.includes(c.toLowerCase())) out.add(c);
    }),
  );
  return [...out];
}

export const VPAIRS: [string, string][] = [
  ["sivo", "siva"],
  ["funizi", "funiza"],
  ["funizi", "funizo"],
  ["funizi", "funizu"],
  ["daroke", "droké"],
  ["ena", "e-"],
  ["kanora", "kenara"],
];
export const ORAL = new Set(["droké", "e-"]);

export const AFFIX_TOKENS = (() => {
  const out: { tok: string; aff: string; base: string; fr?: string }[] = [];
  const seen = new Set<string>();
  sentences.forEach((s) =>
    tokens(s.g).forEach((tok) => {
      const a = analyze(tok);
      const c = clean(tok);
      if (a.aff.length === 1 && !seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        out.push({ tok: c, aff: a.aff[0], base: a.base, fr: a.entry?.f });
      }
    }),
  );
  return out;
})();

// ---------- Questions de grammaire : uniquement des règles déjà énoncées dans les notes de leçon ----------
export type Gram = { u: number[]; q: string; opts: string[]; rule: string };
export const GRAMMAR: Gram[] = [
  { u: [1, 5], q: "Quel est l'ordre de la phrase en galme ?", opts: ["sujet + verbe + complément", "verbe + sujet + complément", "complément + sujet + verbe", "verbe + complément + sujet"], rule: "Ordre de la phrase : sujet + verbe + complément." },
  { u: [1], q: "Où se place « pre- » (le passé) ?", opts: ["Avant le verbe", "Après le verbe", "À la fin de la phrase", "Au début de la phrase"], rule: "pre- (passé) et fu- (futur) se placent avant le verbe." },
  { u: [1], q: "Où se place « fu- » (le futur) ?", opts: ["Avant le verbe", "Après le verbe", "Après le nom", "À la fin de la phrase"], rule: "pre- (passé) et fu- (futur) se placent avant le verbe." },
  { u: [1], q: "Que marque « fu- » ?", opts: ["Le futur", "Le passé", "Le conditionnel", "La question"], rule: "fu- marque le futur." },
  { u: [1], q: "Que marque « pre- » ?", opts: ["Le passé", "Le futur", "Le conditionnel", "La question"], rule: "pre- marque le passé." },
  { u: [1], q: "Où se place « -ko » ?", opts: ["Après le verbe", "Avant le verbe", "Avant le sujet", "Avant le nom"], rule: "-ko pose la question, après le verbe." },
  { u: [1], q: "Que marque « -ko » ?", opts: ["La question", "Le conditionnel", "Le futur", "Le passé"], rule: "-ko pose la question." },
  { u: [1], q: "Que marque « -vo » ?", opts: ["Le conditionnel", "La question", "Le futur", "Le passé"], rule: "-vo marque le conditionnel." },
  { u: [1], q: "Que fait « sha » (par exemple dans amora-sha) ?", opts: ["Il exprime le contraire", "Il marque le futur", "Il pose la question", "Il marque le passé"], rule: "sha exprime le contraire (amora-sha)." },
  { u: [1], q: "Que signifie « lano » ?", opts: ["ma / mon", "sa / son", "notre", "toi"], rule: "lano = ma/mon." },
  { u: [1], q: "Que signifie « rae » ?", opts: ["sa / son", "ma / mon", "notre", "vous"], rule: "rae = sa/son." },
  { u: [1, 4], q: "Où se place l'adjectif par rapport au nom ?", opts: ["Avant le nom", "Après le nom", "À la fin de la phrase", "Avant le verbe"], rule: "Les adjectifs se placent avant le nom (varo-mona = grande monnaie)." },
  { u: [1, 2], q: "Un mot peut-il changer de terminaison sans changer de sens ?", opts: ["Oui, pour que ça sonne bien à l'oreille", "Non, jamais", "Oui, mais seulement au pluriel", "Oui, mais seulement à l'écrit"], rule: "Un mot peut changer de terminaison sans changer de sens (funizi, funiza, funizo, funizu) : c'est pour que ça sonne bien à l'oreille." },
  { u: [0], q: "À l'oral, comment « ena » peut-il s'abréger ?", opts: ["e-", "en-", "na-", "a-"], rule: "À l'oral, ena peut s'abréger en « e- » ; à l'écrit formel, on garde ena." },
  { u: [0], q: "Quelle forme garde-t-on à l'écrit formel ?", opts: ["ena", "e-", "eha", "na"], rule: "À l'écrit formel, on garde ena." },
  { u: [0], q: "« siva » est…", opts: ["une variante de sivo", "une variante de ena", "un verbe", "le contraire de sivo"], rule: "Siva est une variante de sivo." },
  { u: [2], q: "À l'oral, « daroke » peut devenir…", opts: ["droké", "daroka", "darok", "doroke"], rule: "À l'oral, daroke peut devenir droké." },
  { u: [2], q: "Que signifie « pre-daroke » ?", opts: ["a donné", "donnera", "donne", "ne donne pas"], rule: "pre-daroke (a donné)." },
  { u: [2], q: "Que signifie « fu-sagne » ?", opts: ["saura", "a su", "sait", "ne sait pas"], rule: "fu-sagne (saura)." },
];

// ---------- Parcours : niveaux et leçons (regroupements du corpus existant) ----------
export type Level = { n: number; name: string; desc: string; units: number[] };
export const LEVELS: Level[] = [
  { n: 1, name: "Débutant", desc: "Les pronoms et les mots du quotidien", units: [0, 3] },
  { n: 2, name: "Élémentaire", desc: "Grammaire et petits mots", units: [1] },
  { n: 3, name: "Intermédiaire", desc: "Les verbes", units: [2] },
  { n: 4, name: "Avancé", desc: "Noms et adjectifs", units: [4] },
  { n: 5, name: "Expert", desc: "Des phrases entières", units: [5] },
];

export type Lesson = { id: string; level: number; unit: number; title: string; ids: number[]; index: number };
export const LESSONS: Lesson[] = (() => {
  const out: Lesson[] = [];
  for (const lv of LEVELS) {
    for (const u of lv.units) {
      const L = C.filter((c) => c.u === u);
      const parts = Math.max(1, Math.ceil(L.length / 12));
      const size = Math.ceil(L.length / parts);
      for (let p = 0; p < parts; p++) {
        out.push({
          id: `n${lv.n}-u${u}-${p + 1}`,
          level: lv.n,
          unit: u,
          title: U[u] + (parts > 1 ? ` · partie ${p + 1}` : ""),
          ids: L.slice(p * size, (p + 1) * size).map((c) => c.id),
          index: out.length,
        });
      }
    }
  }
  return out;
})();
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonOfWord = (id: number) => LESSONS.find((l) => l.ids.includes(id));
export const levelWords = (n: number) => {
  const lv = LEVELS.find((l) => l.n === n);
  return lv ? C.filter((c) => lv.units.includes(c.u)) : [];
};

// ---------- Bibliothèque : textes assemblés à partir du corpus existant ----------
export type TextDef = { id: string; title: string; level: number; desc: string; kind: "phrases" | "mots"; lines: number[] };
const nz = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const find = (gs: string[]) =>
  gs.map((g) => C.find((c) => nz(c.g) === nz(g))?.id).filter((x): x is number => typeof x === "number");

export const TEXTS: TextDef[] = [
  { id: "salutations", title: "Les salutations", level: 1, kind: "mots", desc: "Les mots de politesse et de tous les jours.", lines: find(["zhoyama", "viwansaj", "vayara sola pazo", "nasamora", "chi", "selami", "ehisarok"]) },
  { id: "se-presenter", title: "Se présenter", level: 3, kind: "phrases", desc: "Dire son nom et parler de sa pratique du galme.", lines: find(["ena kala Sacha", "ena spozi vi", "vosu spozi-ko ?", "ena poko spozi na Galme, thoda, ena vi spozi na franzi"]) },
  { id: "affection", title: "Dire l'affection", level: 3, kind: "phrases", desc: "Aimer, ne pas aimer, demander.", lines: find(["ena amora siva", "ena amora-sha siva", "ena amora-ko siva ?", "siva manka lano", "siva kora ilie bela bela"]) },
  { id: "questions", title: "Poser des questions", level: 4, kind: "phrases", desc: "Les questions avec -ko et « eh ».", lines: find(["siva kanora-ko ?", "vosu spozi-ko ?", "siva amora eh-ko ?", "san eh san-ko ?"]) },
  { id: "peuple", title: "Le peuple et la pensée", level: 4, kind: "phrases", desc: "Affirmer, penser, dominer.", lines: find(["san ilie lano fozel", "thoda ena malo malo ena", "dia zolo fu-sagne", "ena tsushima sivo"]) },
  { id: "argent", title: "L'argent et le temps", level: 5, kind: "phrases", desc: "Passé, futur et conditionnel en situation.", lines: find(["narai pre-daroke sivo mona, thodo siva pre-vramdra sha", "ena fu-saroke nuna, devora sha hesidare", "ena ve-sela zebo san", "dia zolo fu-sagne"]) },
];
export const textById = (id: string) => TEXTS.find((t) => t.id === id);

export const APP_VERSION = "3.0.0";
