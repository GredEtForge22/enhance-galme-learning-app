"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { APP_VERSION } from "@/data/galme";
import { merge, sanitize, type Progress } from "@/lib/progress";
import { useStore } from "@/lib/store";

const THEME_LABELS: [string, string, string][] = [
  ["auto", "Automatique", "suit ton appareil"],
  ["clair", "Clair", "#0d7c85"],
  ["sombre", "Sombre", "#4fc4cc"],
  ["aurore", "Aurore", "#8a3fc4"],
  ["foret", "Forêt", "#6fd39a"],
  ["sepia", "Sépia", "#8a5a1e"],
  ["contraste", "Contraste élevé", "#ffe14d"],
];

export default function Parametres() {
  const { P, update, replace, toast, account, sync, syncing, lastSync } = useStore();
  const s = P.settings;
  const set = (fn: (s: typeof P.settings) => void) => update((p) => fn(p.settings));
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Progress | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ app: "galme", version: APP_VERSION, exportedAt: new Date().toISOString(), data: P }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `galme-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Sauvegarde exportée.");
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 2_000_000) return toast("Fichier trop volumineux.");
    try {
      const j = JSON.parse(await f.text());
      const p = sanitize(j && typeof j === "object" && "data" in j ? j.data : j);
      if (!p) return toast("Ce fichier n'est pas une sauvegarde Galme valide.");
      setPending(p);
    } catch {
      toast("Fichier illisible.");
    }
    if (file.current) file.current.value = "";
  };

  const askNotif = async (on: boolean) => {
    if (on && "Notification" in window && Notification.permission === "default") {
      const r = await Notification.requestPermission();
      if (r !== "granted") toast("Notifications du navigateur refusées : le rappel s'affichera seulement dans l'appli.");
    }
    set((x) => { x.notif = on; });
  };

  return (
    <>
      <h1>Paramètres</h1>

      <section className="box" aria-labelledby="s1">
        <h2 id="s1">Profil et objectif</h2>
        <label htmlFor="nm">Prénom ou pseudo affiché</label>
        <input id="nm" type="text" value={s.name} maxLength={24} onChange={(e) => set((x) => { x.name = e.target.value.replace(/[<>]/g, ""); })} />
        <label htmlFor="gl">Objectif quotidien : {s.goal} réponses</label>
        <input id="gl" type="range" min={10} max={200} step={5} value={s.goal} onChange={(e) => set((x) => { x.goal = +e.target.value; })} style={{ width: "100%" }} />
      </section>

      <section className="box" aria-labelledby="s2">
        <h2 id="s2">Apparence</h2>
        <div role="radiogroup" aria-label="Thème visuel">
          {THEME_LABELS.map(([k, l, c]) => (
            <button key={k} role="radio" aria-checked={s.theme === k} className={`ch ${s.theme === k ? "sel" : ""}`} onClick={() => set((x) => { x.theme = k; })}>
              <span className="swatch" style={{ background: c.startsWith("#") ? c : "linear-gradient(90deg,#fff 50%,#0d1124 50%)" }} />{l}{s.theme === k ? " ✓" : ""}
            </button>
          ))}
        </div>
        <label htmlFor="fs">Taille du texte : {s.fontScale} %</label>
        <input id="fs" type="range" min={90} max={140} step={5} value={s.fontScale} onChange={(e) => set((x) => { x.fontScale = +e.target.value; })} style={{ width: "100%" }} />
      </section>

      <section className="box" aria-labelledby="s3">
        <h2 id="s3">Rappels et raccourcis</h2>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={s.notif} onChange={(e) => askNotif(e.target.checked)} /> Rappel quotidien (appli ouverte)</label>
        {s.notif && (
          <>
            <label htmlFor="nt">Heure du rappel</label>
            <input id="nt" type="time" value={s.notifTime} onChange={(e) => set((x) => { x.notifTime = e.target.value || "18:00"; })} style={{ width: 160 }} />
            <p className="note">Le rappel apparaît si ton objectif du jour n&apos;est pas atteint. Il nécessite que Galme soit ouvert dans un onglet.</p>
          </>
        )}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={s.keys} onChange={(e) => set((x) => { x.keys = e.target.checked; })} /> Raccourcis clavier (appuie sur <kbd>?</kbd> pour la liste)</label>
      </section>

      <section className="box" aria-labelledby="s4">
        <h2 id="s4">Sauvegarde</h2>
        <p className="note">Ta progression est enregistrée automatiquement sur cet appareil, avec une copie de secours restaurée toute seule en cas de problème. Exporte-la pour la transférer ou la conserver.</p>
        <div className="row">
          <button className="btn sm" onClick={exportData}>Exporter ma progression</button>
          <button className="btn sm alt" onClick={() => file.current?.click()}>Importer une sauvegarde</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} aria-label="Fichier de sauvegarde" />
        </div>
        {pending && (
          <div className="pop" role="alertdialog" aria-label="Importer la sauvegarde">
            <p style={{ marginTop: 0 }}><b>Sauvegarde reconnue</b> : {pending.xp} XP, {Object.keys(pending.cards).length} entrées travaillées. Comment l&apos;importer ?</p>
            <div className="row">
              <button className="btn sm" onClick={() => { replace(merge(P, pending)); setPending(null); toast("Sauvegarde fusionnée."); }}>Fusionner avec ma progression</button>
              <button className="btn sm alt" onClick={() => { replace({ ...pending, modified: Date.now() }); setPending(null); toast("Sauvegarde importée."); }}>Remplacer</button>
              <button className="btn sm alt" onClick={() => setPending(null)}>Annuler</button>
            </div>
          </div>
        )}
      </section>

      <section className="box" aria-labelledby="s5">
        <h2 id="s5">Compte et synchronisation</h2>
        {account ? (
          <>
            <p>Connecté en tant que <b>{account.pseudo}</b>.</p>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={s.autoSync} onChange={(e) => set((x) => { x.autoSync = e.target.checked; })} /> Synchroniser automatiquement</label>
            <button className="btn alt" disabled={syncing} onClick={async () => toast(await sync())}>{syncing ? "Synchronisation…" : "Synchroniser maintenant"}</button>
            {lastSync && <p className="note">Dernière synchronisation : {new Date(lastSync).toLocaleTimeString("fr-FR")}</p>}
          </>
        ) : (
          <p className="note">Crée un compte pour retrouver ta progression sur tous tes appareils. <Link href="/compte">Se connecter</Link></p>
        )}
      </section>

      <p className="foot">Galme · version {APP_VERSION}</p>
    </>
  );
}
