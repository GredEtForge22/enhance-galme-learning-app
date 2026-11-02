import { C } from "@/data/galme";
import type { Progress } from "./progress";
import { bestStreak } from "./stats";

export type Badge = { id: string; name: string; desc: string; icon: string; test: (p: Progress) => boolean };

const mastered = (p: Progress) => C.filter((c) => p.cards[c.id]?.b >= 4).length;
const anyPassed = (p: Progress) => Object.values(p.exams).some((e) => e.passed);

export const BADGES: Badge[] = [
  { id: "first-session", name: "Première séance", desc: "Terminer une première séance.", icon: "🌱", test: (p) => p.sessions >= 1 },
  { id: "first-word", name: "Premier mot appris", desc: "Faire progresser un premier mot.", icon: "💡", test: (p) => Object.values(p.cards).some((c) => c.b >= 1) },
  { id: "first-sentence", name: "Première phrase traduite", desc: "Réussir une question sur une phrase entière.", icon: "✍️", test: (p) => p.sentOk >= 1 },
  { id: "m10", name: "10 mots maîtrisés", desc: "Maîtriser 10 entrées du dictionnaire.", icon: "🔟", test: (p) => mastered(p) >= 10 },
  { id: "m50", name: "50 mots maîtrisés", desc: "Maîtriser 50 entrées du dictionnaire.", icon: "🏅", test: (p) => mastered(p) >= 50 },
  { id: "m100", name: "100 mots maîtrisés", desc: "Maîtriser 100 entrées du dictionnaire.", icon: "💯", test: (p) => mastered(p) >= 100 },
  { id: "s7", name: "7 jours consécutifs", desc: "Apprendre 7 jours d'affilée.", icon: "🔥", test: (p) => bestStreak(p) >= 7 },
  { id: "s30", name: "30 jours consécutifs", desc: "Apprendre 30 jours d'affilée.", icon: "🌟", test: (p) => bestStreak(p) >= 30 },
  { id: "s100", name: "100 jours consécutifs", desc: "Apprendre 100 jours d'affilée.", icon: "👑", test: (p) => bestStreak(p) >= 100 },
  { id: "first-lesson", name: "Première leçon terminée", desc: "Terminer une leçon du parcours.", icon: "📘", test: (p) => Object.values(p.lessons).some((l) => l.done) },
  { id: "first-exam", name: "Premier examen réussi", desc: "Réussir un examen de niveau.", icon: "🎓", test: anyPassed },
  { id: "perfect", name: "100 % de réussite", desc: "Terminer une séance sans aucune erreur (8 réponses minimum).", icon: "🎯", test: (p) => p.perfect >= 1 },
  { id: "rush-record", name: "Record du contre-la-montre", desc: "Battre son record au contre-la-montre.", icon: "⏱️", test: (p) => !!p.flags.rushRecord },
  { id: "dico-full", name: "Maîtrise complète du dictionnaire", desc: "Maîtriser toutes les entrées.", icon: "🏆", test: (p) => mastered(p) >= C.length },
];

/** Renvoie les badges nouvellement obtenus (et les enregistre). */
export function unlockBadges(p: Progress, today: number): Badge[] {
  const out: Badge[] = [];
  for (const b of BADGES) {
    if (!p.badges[b.id] && b.test(p)) {
      p.badges[b.id] = today;
      p.xp += 25;
      out.push(b);
    }
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
