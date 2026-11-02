"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { unlockBadges } from "./gamification";
import { Progress, defaultProgress, merge, migrateV2, sanitize } from "./progress";
import { levelOf, streak } from "./stats";
import { day } from "./text";

export type Account = { id: number; pseudo: string; isPublic: boolean } | null;
type Toast = { id: number; msg: string };
type Ctx = {
  P: Progress;
  ready: boolean;
  update: (fn: (p: Progress) => void) => void;
  replace: (p: Progress) => void;
  toast: (msg: string) => void;
  toasts: Toast[];
  account: Account;
  setAccount: (a: Account) => void;
  sync: () => Promise<string>;
  syncing: boolean;
  lastSync: number | null;
};

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore hors provider");
  return c;
};

const KEY = "galme3", BAK = "galme3_bak", BAKT = "galme3_bakt";

function load(): { p: Progress; note?: string } {
  const tryParse = (k: string, f: (x: unknown) => Progress | null) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? f(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  };
  const main = tryParse(KEY, sanitize);
  if (main) return { p: main };
  const bak = tryParse(BAK, sanitize);
  if (bak) return { p: bak, note: "Sauvegarde automatique restaurée." };
  const old = tryParse("galme2", migrateV2);
  if (old) return { p: old, note: "Ta progression de l'ancienne version a été reprise." };
  return { p: defaultProgress() };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [P, setP] = useState<Progress>(() => defaultProgress());
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [account, setAccount] = useState<Account>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const pRef = useRef<Progress>(P);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAct = useRef(Date.now());
  const pendingSecs = useRef(0);
  const synced = useRef(0);
  const failed = useRef(false);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  // Sauvegarde automatique : fichier principal + copie de secours tournante (toutes les 5 min).
  const persist = useCallback(() => {
    try {
      const prev = localStorage.getItem(KEY);
      if (prev && Date.now() - +(localStorage.getItem(BAKT) || 0) > 300000) {
        localStorage.setItem(BAK, prev);
        localStorage.setItem(BAKT, String(Date.now()));
      }
      localStorage.setItem(KEY, JSON.stringify(pRef.current));
      localStorage.setItem("galme3-theme", pRef.current.settings.theme);
      failed.current = false;
    } catch {
      if (!failed.current) {
        failed.current = true;
        toast("Sauvegarde locale impossible (stockage plein ?). Exporte ta progression depuis Paramètres.");
      }
    }
  }, [toast]);

  const schedule = useCallback(() => {
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(persist, 350);
  }, [persist]);

  const update = useCallback((fn: (p: Progress) => void) => {
    const before = pRef.current;
    const n: Progress = structuredClone(before);
    fn(n);
    const lv0 = levelOf(before.xp).n;
    const nb = unlockBadges(n, day());
    n.rec.bestStreak = Math.max(n.rec.bestStreak, streak(n));
    n.modified = Date.now();
    pRef.current = n;
    setP(n);
    schedule();
    nb.forEach((b) => toast(`Badge débloqué : ${b.icon} ${b.name}`));
    const lv1 = levelOf(n.xp);
    if (lv1.n > lv0) toast(`Niveau ${lv1.n} atteint : ${lv1.name} !`);
  }, [schedule, toast]);

  const replace = useCallback((p: Progress) => {
    pRef.current = p;
    setP(p);
    persist();
  }, [persist]);

  // Chargement initial (localStorage n'existe que côté client)
  useEffect(() => {
    const { p, note } = load();
    pRef.current = p;
    setP(p);
    setReady(true);
    if (note) setTimeout(() => toast(note), 400);
    fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then((j) => setAccount(j.user ?? null)).catch(() => {});
    const flush = () => {
      if (saveT.current) clearTimeout(saveT.current);
      persist();
    };
    const onVis = () => { if (document.hidden) { flushSecs(); flush(); } };
    const act = () => { lastAct.current = Date.now(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) => window.addEventListener(e, act, { passive: true }));
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
      ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) => window.removeEventListener(e, act));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Temps passé à apprendre : compté seulement si l'onglet est visible et actif
  const flushSecs = useCallback(() => {
    const s = pendingSecs.current;
    if (s <= 0) return;
    pendingSecs.current = 0;
    update((p) => {
      const d = day();
      const x = p.days[d] || (p.days[d] = { a: 0, c: 0, s: 0, x: 0 });
      x.s = Math.min(86400, x.s + s);
    });
  }, [update]);

  useEffect(() => {
    if (!ready) return;
    const iv = setInterval(() => {
      if (!document.hidden && Date.now() - lastAct.current < 45000) pendingSecs.current++;
      if (pendingSecs.current >= 20) flushSecs();
    }, 1000);
    return () => clearInterval(iv);
  }, [ready, flushSecs]);

  // Rappel quotidien (notification navigateur + message dans l'appli)
  useEffect(() => {
    if (!ready || !P.settings.notif) return;
    const check = () => {
      const now = new Date();
      const [h, m] = pRef.current.settings.notifTime.split(":").map(Number);
      if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
      const d = day();
      if (localStorage.getItem("galme3_notified") === String(d)) return;
      if ((pRef.current.days[d]?.a ?? 0) >= pRef.current.settings.goal) return;
      localStorage.setItem("galme3_notified", String(d));
      const body = "Ta séance du jour t'attend : quelques minutes suffisent pour garder ta série.";
      toast("🔔 " + body);
      try {
        if ("Notification" in window && Notification.permission === "granted") new Notification("Galme", { body });
      } catch { /* ignore */ }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [ready, P.settings.notif, toast]);

  // Apparence : thème et taille du texte
  useEffect(() => {
    if (!ready) return;
    const el = document.documentElement;
    if (P.settings.theme === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", P.settings.theme);
    el.style.fontSize = P.settings.fontScale + "%";
  }, [ready, P.settings.theme, P.settings.fontScale]);

  // Synchronisation cloud : fusion intelligente (jamais de perte) puis envoi
  const sync = useCallback(async (): Promise<string> => {
    setSyncing(true);
    try {
      const r = await fetch("/api/sync", { cache: "no-store" });
      if (r.status === 401) {
        setAccount(null);
        return "Session expirée : reconnecte-toi.";
      }
      const j = await r.json();
      let merged = pRef.current;
      if (j.data) {
        const remote = sanitize(j.data);
        if (remote) merged = merge(pRef.current, remote);
      }
      if (merged !== pRef.current) replace(merged);
      const w = await fetch("/api/sync", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: merged }) });
      if (!w.ok) return "Échec de l'envoi.";
      synced.current = merged.modified;
      setLastSync(Date.now());
      return "Progression synchronisée.";
    } catch {
      return "Hors ligne : la synchronisation sera retentée plus tard.";
    } finally {
      setSyncing(false);
    }
  }, [replace]);

  useEffect(() => {
    if (!ready || !account || !P.settings.autoSync) return;
    if (synced.current === P.modified) return;
    const t = setTimeout(() => { sync(); }, synced.current === 0 ? 800 : 30000);
    return () => clearTimeout(t);
  }, [ready, account, P.modified, P.settings.autoSync, sync]);

  return (
    <StoreCtx.Provider value={{ P, ready, update, replace, toast, toasts, account, setAccount, sync, syncing, lastSync }}>
      {children}
    </StoreCtx.Provider>
  );
}
