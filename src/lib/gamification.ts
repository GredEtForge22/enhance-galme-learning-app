// src/lib/gamification.ts
import { C, LEVELS, LESSONS, TEXTS, TO } from "@/data/galme";
import type { Progress } from "./progress";
import {
  bestStreak,
  lessonsDone,
  levelDone,
  levelLessons,
  masteredSentences,
  successRate,
  totalAnswers,
  totalSecs,
} from "./stats";

export type Badge = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  /** XP accordés à l'unlock (défaut 25). */
  xp?: number;
  test: (p: Progress) => boolean;
};

// ---------- helpers ----------
const mastered = (p: Progress) => C.filter((c) => p.cards[c.id]?.b >= 4).length;
const masteredOf = (p: Progress, pred: (c: (typeof C)[number]) => boolean) =>
  C.filter((c) => pred(c) && p.cards[c.id]?.b >= 4).length;
const totalOf = (pred: (c: (typeof C)[number]) => boolean) => C.filter(pred).length;
const allOfType = (p: Progress, t: string) => {
  const n = totalOf((c) => c.t === t);
  return n > 0 && masteredOf(p, (c) => c.t === t) >= n;
};
const allOfUnit = (p: Progress, u: number) => {
  const n = totalOf((c) => c.u === u);
  return n > 0 && masteredOf(p, (c) => c.u === u) >= n;
};
const anyPassed = (p: Progress) => Object.values(p.exams).some((e) => e.passed);
const examsPassed = (p: Progress) => LEVELS.filter((l) => p.exams["n" + l.n]?.passed).length;
const textsRead = (p: Progress) => TEXTS.filter((t) => p.texts[t.id]?.read).length;
const entryByG = (g: string) => C.find((c) => c.g.toLowerCase() === g.toLowerCase());
const masteredG = (p: Progress, g: string) => {
  const e = entryByG(g);
  return !!e && (p.cards[e.id]?.b ?? 0) >= 4;
};
/** Jours où l'objectif quotidien est atteint. */
const goalDays = (p: Progress) =>
  Object.values(p.days).filter((d) => d.a >= (p.settings.goal || 30)).length;
/** Au moins une fois revenu après ≥ gap jours d'absence. */
const hasComeback = (p: Progress, gap = 7) => {
  const ks = Object.keys(p.days)
    .map(Number)
    .filter((k) => p.days[k].a > 0)
    .sort((a, b) => a - b);
  for (let i = 1; i < ks.length; i++) if (ks[i] - ks[i - 1] >= gap + 1) return true;
  return false;
};
/** Mots durs : beaucoup d'échecs puis maîtrisés. */
const hardMastered = (p: Progress) =>
  C.filter((c) => {
    const card = p.cards[c.id];
    if (!card || card.b < 4) return false;
    return card.ko >= 3 || (p.errs[c.id] ?? 0) >= 3;
  }).length;

// ---------- badges ----------
export const BADGES: Badge[] = [
  // ===== Déjà existants (conservés) =====
  { id: "first-session", name: "Première séance", desc: "Terminer une première séance.", icon: "🌱", test: (p) => p.sessions >= 1 },
  { id: "first-word", name: "Premier mot appris", desc: "Faire progresser un premier mot.", icon: "💡", test: (p) => Object.values(p.cards).some((c) => c.b >= 1) },
  { id: "first-sentence", name: "Première phrase traduite", desc: "Réussir une question sur une phrase entière.", icon: "✍️", test: (p) => p.sentOk >= 1 },
  { id: "m10", name: "10 mots maîtrisés", desc: "Maîtriser 10 entrées du dictionnaire.", icon: "🔟", test: (p) => mastered(p) >= 10 },
  { id: "m50", name: "50 mots maîtrisés", desc: "Maîtriser 50 entrées du dictionnaire.", icon: "🏅", test: (p) => mastered(p) >= 50 },
  { id: "m100", name: "100 mots maîtrisés", desc: "Maîtriser 100 entrées du dictionnaire.", icon: "💯", test: (p) => mastered(p) >= 100 },
  { id: "s7", name: "7 jours consécutifs", desc: "Apprendre 7 jours d'affilée.", icon: "🔥", test: (p) => bestStreak(p) >= 7 },
  { id: "s30", name: "30 jours consécutifs", desc: "Apprendre 30 jours d'affilée.", icon: "🌟", test: (p) => bestStreak(p) >= 30 },
  { id: "s100", name: "100 jours consécutifs", desc: "Apprendre 100 jours d'affilée.", icon: "👑", xp: 100, test: (p) => bestStreak(p) >= 100 },
  { id: "first-lesson", name: "Première leçon terminée", desc: "Terminer une leçon du parcours.", icon: "📘", test: (p) => Object.values(p.lessons).some((l) => l.done) },
  { id: "first-exam", name: "Premier examen réussi", desc: "Réussir un examen de niveau.", icon: "🎓", test: anyPassed },
  { id: "perfect", name: "100 % de réussite", desc: "Terminer une séance sans aucune erreur (8 réponses minimum).", icon: "🎯", test: (p) => p.perfect >= 1 },
  { id: "rush-record", name: "Record du contre-la-montre", desc: "Battre son record au contre-la-montre.", icon: "⏱️", test: (p) => !!p.flags.rushRecord },
  { id: "dico-full", name: "Maîtrise complète du dictionnaire", desc: "Maîtriser toutes les entrées.", icon: "🏆", xp: 100, test: (p) => mastered(p) >= C.length },

  // ===== Vocabulaire / maîtrise =====
  { id: "m25", name: "Quart de dictionnaire", desc: "Maîtriser 25 entrées du dictionnaire.", icon: "📗", test: (p) => mastered(p) >= 25 },
  { id: "m75", name: "Trois-quarts", desc: "Maîtriser 75 entrées du dictionnaire.", icon: "🥇", test: (p) => mastered(p) >= 75 },
  {
    id: "words-half",
    name: "À mi-chemin",
    desc: "Maîtriser au moins la moitié du dictionnaire.",
    icon: "🌓",
    test: (p) => mastered(p) >= Math.ceil(C.length / 2),
  },
  { id: "phrases-10", name: "Conteur", desc: "Maîtriser 10 phrases entières.", icon: "📜", test: (p) => masteredSentences(p) >= 10 },
  {
    id: "phrases-all",
    name: "Orateur",
    desc: "Maîtriser toutes les phrases du corpus.",
    icon: "🎤",
    xp: 50,
    test: (p) => {
      const n = totalOf((c) => c.u === 5);
      return n > 0 && masteredSentences(p) >= n;
    },
  },
  { id: "all-pronouns", name: "Je, tu, nous…", desc: "Maîtriser tous les pronoms.", icon: "👤", test: (p) => allOfType(p, "Pronom") },
  { id: "all-verbs", name: "Maître des verbes", desc: "Maîtriser tous les verbes.", icon: "⚡", test: (p) => allOfType(p, "Verbe") },
  { id: "all-nouns", name: "Lexique vivant", desc: "Maîtriser tous les noms.", icon: "📦", test: (p) => allOfType(p, "Nom") },
  { id: "all-adj", name: "Nuances", desc: "Maîtriser tous les adjectifs.", icon: "🎨", test: (p) => allOfType(p, "Adjectif") },
  { id: "all-adv", name: "Avec précision", desc: "Maîtriser tous les adverbes.", icon: "📐", test: (p) => allOfType(p, "Adverbe") },
  { id: "all-part", name: "Petits mots", desc: "Maîtriser toutes les particules.", icon: "🔩", test: (p) => allOfType(p, "Particule") },
  { id: "all-expr", name: "Formules prêtes", desc: "Maîtriser toutes les expressions.", icon: "💬", test: (p) => allOfType(p, "Expression") },
  {
    id: "polyglot-cat",
    name: "Touche-à-tout",
    desc: "Maîtriser au moins un mot dans chaque catégorie.",
    icon: "🌈",
    test: (p) => TO.every((t) => C.some((c) => c.t === t && (p.cards[c.id]?.b ?? 0) >= 4)),
  },
  { id: "grammar-guru", name: "Grammairien", desc: "Maîtriser toute l'unité Grammaire et petits mots.", icon: "📖", test: (p) => allOfUnit(p, 1) },
  { id: "unit-salute", name: "Politesse", desc: "Maîtriser toute l'unité Salutations / quotidien.", icon: "🙏", test: (p) => allOfUnit(p, 3) },

  // ===== Parcours / leçons / examens =====
  { id: "lessons-5", name: "Sur la lancée", desc: "Terminer 5 leçons.", icon: "📚", test: (p) => lessonsDone(p) >= 5 },
  { id: "lessons-10", name: "Assidu du parcours", desc: "Terminer 10 leçons.", icon: "📗", test: (p) => lessonsDone(p) >= 10 },
  {
    id: "lessons-all",
    name: "Fin du parcours",
    desc: "Terminer toutes les leçons.",
    icon: "🏁",
    xp: 75,
    test: (p) => LESSONS.length > 0 && lessonsDone(p) >= LESSONS.length,
  },
  { id: "exam-n1", name: "Diplômé débutant", desc: "Réussir l'examen du niveau 1.", icon: "1️⃣", test: (p) => !!p.exams.n1?.passed },
  { id: "exam-n2", name: "Diplômé élémentaire", desc: "Réussir l'examen du niveau 2.", icon: "2️⃣", test: (p) => !!p.exams.n2?.passed },
  { id: "exam-n3", name: "Diplômé intermédiaire", desc: "Réussir l'examen du niveau 3.", icon: "3️⃣", test: (p) => !!p.exams.n3?.passed },
  { id: "exam-n4", name: "Diplômé avancé", desc: "Réussir l'examen du niveau 4.", icon: "4️⃣", test: (p) => !!p.exams.n4?.passed },
  { id: "exam-n5", name: "Expert certifié", desc: "Réussir l'examen du niveau 5.", icon: "5️⃣", xp: 50, test: (p) => !!p.exams.n5?.passed },
  {
    id: "all-exams",
    name: "Grand oral",
    desc: "Réussir tous les examens de niveau.",
    icon: "🏛️",
    xp: 100,
    test: (p) => LEVELS.length > 0 && examsPassed(p) >= LEVELS.length,
  },
  {
    id: "exam-perfect",
    name: "Sans faute à l'exam",
    desc: "Obtenir 100 % à un examen de niveau.",
    icon: "💎",
    xp: 50,
    test: (p) => Object.values(p.exams).some((e) => e.passed && e.best >= 100),
  },
  {
    id: "level-complete-1",
    name: "Niveau 1 bouclé",
    desc: "Toutes les leçons du niveau 1 + examen réussi.",
    icon: "🧩",
    test: (p) => {
      const L = levelLessons(1);
      return L.length > 0 && levelDone(p, 1) >= L.length && !!p.exams.n1?.passed;
    },
  },
  {
    id: "level-complete-5",
    name: "Niveau 5 bouclé",
    desc: "Toutes les leçons du niveau 5 + examen réussi.",
    icon: "🧩",
    xp: 75,
    test: (p) => {
      const L = levelLessons(5);
      return L.length > 0 && levelDone(p, 5) >= L.length && !!p.exams.n5?.passed;
    },
  },

  // ===== Assiduité & temps =====
  { id: "s3", name: "Coup d'envoi", desc: "Apprendre 3 jours d'affilée.", icon: "✨", test: (p) => bestStreak(p) >= 3 },
  { id: "s14", name: "Deux semaines", desc: "Apprendre 14 jours d'affilée.", icon: "📅", test: (p) => bestStreak(p) >= 14 },
  { id: "s365", name: "Une année galme", desc: "Apprendre 365 jours d'affilée.", icon: "🌌", xp: 150, test: (p) => bestStreak(p) >= 365 },
  { id: "sessions-10", name: "Habitude", desc: "Terminer 10 séances.", icon: "🔁", test: (p) => p.sessions >= 10 },
  { id: "sessions-50", name: "Fidèle", desc: "Terminer 50 séances.", icon: "💪", test: (p) => p.sessions >= 50 },
  { id: "sessions-100", name: "Inarrêtable", desc: "Terminer 100 séances.", icon: "🚀", xp: 50, test: (p) => p.sessions >= 100 },
  { id: "time-1h", name: "Première heure", desc: "Passer 1 heure à apprendre.", icon: "⌛", test: (p) => totalSecs(p) >= 3600 },
  { id: "time-10h", name: "Dix heures", desc: "Passer 10 heures à apprendre.", icon: "🕰️", xp: 50, test: (p) => totalSecs(p) >= 36000 },
  { id: "time-50h", name: "Cinquante heures", desc: "Passer 50 heures à apprendre.", icon: "⏳", xp: 100, test: (p) => totalSecs(p) >= 180000 },
  { id: "goal-7", name: "Objectifs tenus", desc: "Atteindre l'objectif quotidien 7 jours (pas forcément d'affilée).", icon: "🎯", test: (p) => goalDays(p) >= 7 },
  { id: "goal-30", name: "Mois d'objectifs", desc: "Atteindre l'objectif quotidien 30 jours.", icon: "📆", xp: 50, test: (p) => goalDays(p) >= 30 },
  { id: "comeback", name: "Le retour", desc: "Reprendre après au moins 7 jours d'absence.", icon: "🔄", test: (p) => hasComeback(p, 7) },

  // ===== Modes de jeu / records =====
  { id: "survie-10", name: "Survivant", desc: "Atteindre une série de 10 en mode survie.", icon: "🛡️", test: (p) => p.rec.survie >= 10 },
  { id: "survie-25", name: "Incassable", desc: "Atteindre une série de 25 en mode survie.", icon: "🧱", xp: 50, test: (p) => p.rec.survie >= 25 },
  { id: "survie-50", name: "Légende de la survie", desc: "Atteindre une série de 50 en mode survie.", icon: "🏰", xp: 75, test: (p) => p.rec.survie >= 50 },
  { id: "marathon-40", name: "Marathonien", desc: "Score marathon ≥ 40.", icon: "🏃", test: (p) => p.rec.marathon >= 40 },
  { id: "marathon-80", name: "Ultra marathon", desc: "Score marathon ≥ 80.", icon: "🏅", xp: 50, test: (p) => p.rec.marathon >= 80 },
  { id: "nofault-15", name: "Sans faute", desc: "Série sans faute ≥ 15.", icon: "🧊", test: (p) => p.rec.nofault >= 15 },
  { id: "nofault-30", name: "Perfectionniste", desc: "Série sans faute ≥ 30.", icon: "💎", xp: 50, test: (p) => p.rec.nofault >= 30 },
  { id: "rush-facile", name: "Sprint facile", desc: "Établir un record en contre-la-montre facile.", icon: "🟢", test: (p) => (p.rec.rush.facile ?? 0) > 0 },
  { id: "rush-normal", name: "Sprint normal", desc: "Établir un record en contre-la-montre normal.", icon: "🟡", test: (p) => (p.rec.rush.normal ?? 0) > 0 },
  { id: "rush-difficile", name: "Sprint difficile", desc: "Établir un record en contre-la-montre difficile.", icon: "🔴", test: (p) => (p.rec.rush.difficile ?? 0) > 0 },
  {
    id: "rush-all",
    name: "Trio chrono",
    desc: "Avoir un record sur les 3 difficultés du contre-la-montre.",
    icon: "⏰",
    xp: 50,
    test: (p) => (p.rec.rush.facile ?? 0) > 0 && (p.rec.rush.normal ?? 0) > 0 && (p.rec.rush.difficile ?? 0) > 0,
  },
  { id: "perfect-5", name: "En forme", desc: "Réussir 5 séances parfaites.", icon: "🎯", test: (p) => p.perfect >= 5 },
  { id: "perfect-20", name: "Machine", desc: "Réussir 20 séances parfaites.", icon: "🤖", xp: 50, test: (p) => p.perfect >= 20 },
  { id: "best-day-50", name: "Gros jour", desc: "Répondre à au moins 50 questions en une journée.", icon: "📈", test: (p) => p.rec.bestDay >= 50 },
  { id: "best-day-100", name: "Journée monstre", desc: "Répondre à au moins 100 questions en une journée.", icon: "🌋", xp: 50, test: (p) => p.rec.bestDay >= 100 },

  // ===== XP / niveaux apprenant =====
  { id: "xp-100", name: "Apprenti", desc: "Atteindre 100 XP.", icon: "🌱", test: (p) => p.xp >= 100 },
  { id: "xp-500", name: "Habitué", desc: "Atteindre 500 XP.", icon: "⭐", test: (p) => p.xp >= 500 },
  { id: "xp-1400", name: "Confirmé", desc: "Atteindre 1400 XP.", icon: "✨", test: (p) => p.xp >= 1400 },
  { id: "xp-6000", name: "Sage", desc: "Atteindre 6000 XP (niveau Sage).", icon: "🧙", xp: 100, test: (p) => p.xp >= 6000 },
  {
    id: "badge-hunter",
    name: "Chasseur de badges",
    desc: "Débloquer 10 badges.",
    icon: "🎖️",
    test: (p) => Object.keys(p.badges).length >= 10,
  },
  {
    id: "badge-half",
    name: "Collection avancée",
    desc: "Débloquer la moitié des badges.",
    icon: "🏅",
    xp: 50,
    test: (p) => Object.keys(p.badges).length >= Math.ceil(BADGES.length / 2),
  },

  // ===== Bibliothèque / favoris / exploration =====
  { id: "first-text", name: "Premier texte", desc: "Lire un texte de la bibliothèque.", icon: "📖", test: (p) => textsRead(p) >= 1 },
  {
    id: "texts-all",
    name: "Bibliothécaire",
    desc: "Lire tous les textes de la bibliothèque.",
    icon: "🗄️",
    xp: 50,
    test: (p) => TEXTS.length > 0 && textsRead(p) >= TEXTS.length,
  },
  {
    id: "text-perfect",
    name: "Lecture parfaite",
    desc: "Obtenir 100 % sur un texte.",
    icon: "✨",
    test: (p) => Object.values(p.texts).some((t) => (t.best ?? 0) >= 100),
  },
  { id: "fav-1", name: "Coup de cœur", desc: "Mettre un mot en favori.", icon: "💗", test: (p) => p.fav.words.length >= 1 },
  { id: "fav-5", name: "Coups de cœur", desc: "Mettre 5 mots en favori.", icon: "❤️", test: (p) => p.fav.words.length >= 5 },
  { id: "fav-20", name: "Collection privée", desc: "Mettre 20 mots en favori.", icon: "💕", test: (p) => p.fav.words.length >= 20 },
  { id: "searcher", name: "Curieux du dico", desc: "Effectuer au moins 10 recherches.", icon: "🔍", test: (p) => p.searches.length >= 10 },
  { id: "browse-12", name: "Flâneur", desc: "Consulter au moins 12 fiches récemment.", icon: "👀", test: (p) => p.recent.length >= 12 },

  // ===== Défi quotidien =====
  { id: "daily-1", name: "Défi du jour", desc: "Terminer un défi quotidien.", icon: "☀️", test: (p) => p.daily.done || !!p.flags.dailyDone },
  {
    id: "daily-perfect",
    name: "Daily parfait",
    desc: "Réussir un défi quotidien à 100 %.",
    icon: "🌟",
    test: (p) => p.daily.score >= 100 || !!p.flags.dailyPerfect,
  },

  // ===== Qualité =====
  {
    id: "accuracy-90",
    name: "Précis",
    desc: "Atteindre 90 % de réussite (au moins 50 réponses).",
    icon: "🎯",
    test: (p) => totalAnswers(p) >= 50 && successRate(p) >= 90,
  },
  {
    id: "accuracy-95",
    name: "Sniper",
    desc: "Atteindre 95 % de réussite (au moins 100 réponses).",
    icon: "🏹",
    xp: 50,
    test: (p) => totalAnswers(p) >= 100 && successRate(p) >= 95,
  },
  {
    id: "error-fixed",
    name: "Persévérant",
    desc: "Maîtriser un mot que tu avais raté au moins 3 fois.",
    icon: "🛠️",
    test: (p) => hardMastered(p) >= 1,
  },
  {
    id: "hard-words-5",
    name: "Têtu",
    desc: "Maîtriser 5 mots difficiles (3+ erreurs puis maîtrisés).",
    icon: "🧠",
    xp: 50,
    test: (p) => hardMastered(p) >= 5,
  },

  // ===== Lore Galme =====
  { id: "ena", name: "Moi d'abord", desc: "Maîtriser le pronom « ena ».", icon: "🪞", test: (p) => masteredG(p, "ena") },
  {
    id: "amora",
    name: "Cœur galme",
    desc: "Maîtriser la phrase « ena amora siva ».",
    icon: "💖",
    test: (p) => masteredG(p, "ena amora siva"),
  },
];

/** Renvoie les badges nouvellement obtenus (et les enregistre). */
export function unlockBadges(p: Progress, today: number): Badge[] {
  const out: Badge[] = [];
  // Plusieurs passes : certains badges dépendent du nombre de badges déjà débloqués.
  for (let pass = 0; pass < 3; pass++) {
    let gained = false;
    for (const b of BADGES) {
      if (!p.badges[b.id] && b.test(p)) {
        p.badges[b.id] = today;
        p.xp += b.xp ?? 25;
        out.push(b);
        gained = true;
      }
    }
    if (!gained) break;
  }
  return out;
}

export function summaryOf(p: Progress, streakNow: number, lvl: { n: number; name: string }) {
  return {
    xp: p.xp,
    level: lvl.n,
    levelName: lvl.name,
    mastered: mastered(p),
    total: C.length,
    streak: streakNow,
    bestStreak: bestStreak(p),
    badges: Object.keys(p.badges),
    lessons: Object.values(p.lessons).filter((l) => l.done).length,
  };
}
