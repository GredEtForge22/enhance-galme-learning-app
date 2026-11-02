"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

type Res = { kind: string; correct: number; total: number; xp: number; createdAt: string };
const KIND: Record<string, string> = { jour: "Séance du jour", rush: "Contre-la-montre", survie: "Survie", marathon: "Marathon", sansfaute: "Sans faute", defi: "Défi quotidien", "defi-semaine": "Défi de la semaine", examen: "Examen", "examen-niveau": "Examen de niveau", lecon: "Exercices de leçon", quiz: "Quiz", erreurs: "Révision des erreurs" };

export default function Compte() {
  const { account, setAccount, sync, syncing, lastSync, toast } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pseudo, setPseudo] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState<Res[]>([]);

  useEffect(() => {
    if (!account) return;
    fetch("/api/results", { cache: "no-store" }).then((r) => r.json()).then((j) => setHist(j.results ?? [])).catch(() => {});
  }, [account, lastSync]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pseudo, password: pw }) });
      const j = await r.json();
      if (!r.ok) setErr(j.error || "Erreur.");
      else {
        setAccount(j.user);
        setPw("");
        toast(mode === "register" ? "Compte créé : synchronisation en cours…" : "Connecté.");
      }
    } catch {
      setErr("Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccount(null);
    setHist([]);
    toast("Déconnecté. Ta progression reste sur cet appareil.");
  };

  const togglePublic = async () => {
    if (!account) return;
    const r = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !account.isPublic }) });
    if (r.ok) setAccount({ ...account, isPublic: !account.isPublic });
  };

  if (account) {
    return (
      <>
        <h1>Mon compte</h1>
        <section className="box">
          <p>Connecté en tant que <b>{account.pseudo}</b></p>
          <button className="btn" disabled={syncing} onClick={async () => toast(await sync())}>{syncing ? "Synchronisation…" : "Synchroniser maintenant"}</button>
          {lastSync && <p className="note">Dernière synchronisation : {new Date(lastSync).toLocaleTimeString("fr-FR")}</p>}
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
            <input type="checkbox" checked={account.isPublic} onChange={togglePublic} /> Profil public et présence dans les classements
          </label>
          {account.isPublic && <p className="note"><Link href={`/u/${account.pseudo}`}>Voir mon profil public</Link></p>}
          <button className="btn alt" onClick={logout}>Se déconnecter</button>
        </section>
        <section className="box">
          <h2>Historique de mes résultats</h2>
          {hist.length === 0 && <p className="mu">Aucun résultat enregistré pour l&apos;instant. Termine une séance connecté pour l&apos;ajouter ici.</p>}
          {hist.length > 0 && (
            <table>
              <thead><tr><th>Date</th><th>Séance</th><th>Score</th><th>XP</th></tr></thead>
              <tbody>
                {hist.map((h, i) => (
                  <tr key={i}>
                    <td style={{ font: "inherit" }}>{new Date(h.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>{KIND[h.kind] || h.kind}</td>
                    <td>{h.correct}/{h.total}</td>
                    <td>+{h.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <h1>Compte</h1>
      <p className="mu">Optionnel : un compte synchronise ta progression entre appareils et te place dans les classements.</p>
      <section className="box">
        <div className="row" role="tablist">
          <button role="tab" aria-selected={mode === "login"} className={`chip ${mode === "login" ? "on" : ""}`} onClick={() => setMode("login")}>Connexion</button>
          <button role="tab" aria-selected={mode === "register"} className={`chip ${mode === "register" ? "on" : ""}`} onClick={() => setMode("register")}>Créer un compte</button>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="ps">Pseudo</label>
          <input id="ps" type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoComplete="username" autoCapitalize="off" maxLength={20} required />
          <label htmlFor="pw">Mot de passe {mode === "register" && "(8 caractères minimum)"}</label>
          <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} maxLength={100} required />
          {err && <p className="fb ko" role="alert">{err}</p>}
          <button className="btn" disabled={busy}>{mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
        </form>
        <p className="note">Ton mot de passe est stocké de façon chiffrée (scrypt). Ta progression locale est conservée et fusionnée avec celle du compte, sans perte.</p>
      </section>
    </>
  );
}
