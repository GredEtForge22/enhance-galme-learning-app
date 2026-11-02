export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export function shuf<T>(a: readonly T[], rnd: () => number = Math.random): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(a: readonly T[], rnd: () => number = Math.random): T {
  return a[Math.floor(rnd() * a.length)];
}

/** Numéro de jour local (identique à l'application d'origine). */
export const day = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
/** Date calendaire (champs UTC) d'un numéro de jour. */
export const dayDate = (d: number) => new Date(d * 864e5);
/** Début de semaine (lundi) pour un numéro de jour. */
export const weekStart = (d: number) => d - ((d + 3) % 7);
export const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const DOW = ["L", "M", "M", "J", "V", "S", "D"];

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")}`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
}
