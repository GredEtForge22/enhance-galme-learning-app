"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { APP_VERSION } from "@/data/galme";
import { StoreProvider, useStore } from "@/lib/store";
import { levelOf, streak } from "@/lib/stats";

const NAV = [
  { href: "/apprendre", label: "Apprendre", short: "Apprendre", icon: "📖", also: [] as string[] },
  { href: "/s-entrainer", label: "S'entraîner", short: "S'entraîner", icon: "🎯", also: [] },
  { href: "/dictionnaire", label: "Dictionnaire", short: "Dico", icon: "🔤", also: [] },
  { href: "/bibliotheque", label: "Bibliothèque", short: "Biblio", icon: "📚", also: [] },
  { href: "/statistiques", label: "Statistiques", short: "Stats", icon: "📊", also: [] },
  { href: "/profil", label: "Profil", short: "Profil", icon: "👤", also: ["/parametres", "/compte", "/communaute", "/credits", "/a-propos", "/fonctionnement", "/u/"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { P, ready, toasts } = useStore();
  const [help, setHelp] = useState(false);
  const inSession = path.startsWith("/jouer");
  const lv = levelOf(P.xp);
  const active = (n: (typeof NAV)[number]) => path.startsWith(n.href) || n.also.some((a) => path.startsWith(a));

  useEffect(() => {
    if (!P.settings.keys) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (e.altKey && /^[1-6]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        router.push(NAV[+e.key - 1].href);
      } else if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/");
      } else if (e.key === "?" && !typing) {
        setHelp((h) => !h);
      } else if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [P.settings.keys, router]);

  return (
    <>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <header className="hdr">
        <div className="hdr-in">
          <Link href="/" className="brand" aria-label="Galme, accueil">
            GALME
            <small>Plateforme d&apos;apprentissage du Galme</small>
          </Link>
          {!inSession && (
            <nav className="nav-top" aria-label="Navigation principale">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} aria-current={active(n) ? "page" : undefined}>{n.label}</Link>
              ))}
            </nav>
          )}
          {ready && (
            <div className="hdr-xp" aria-label="Progression">
              <span title="Série de jours">🔥 {streak(P)}</span>
              <Link href="/profil" style={{ textDecoration: "none", color: "inherit" }} title={`Niveau ${lv.n} · ${lv.name}`}>Niv. {lv.n} · {P.xp} XP</Link>
            </div>
          )}
        </div>
      </header>

      <main id="contenu" className="wrap">
        {ready ? children : <p className="mu" role="status">Chargement…</p>}
        {!inSession && (
          <footer className="foot">
            Galme · version {APP_VERSION} ·{" "}
            <Link href="/a-propos">À propos</Link> · <Link href="/fonctionnement">Fonctionnement</Link> ·{" "}
            <Link href="/credits">Crédits</Link> · <Link href="/parametres">Paramètres</Link> ·{" "}
            <button onClick={() => setHelp(true)} style={{ background: "none", border: 0, color: "inherit", textDecoration: "underline", cursor: "pointer", font: "inherit" }}>Raccourcis</button>
          </footer>
        )}
      </main>

      {!inSession && (
        <nav className="nav-bot" aria-label="Navigation principale (mobile)">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n) ? "page" : undefined}>
              <span aria-hidden="true">{n.icon}</span>
              {n.short}
            </Link>
          ))}
        </nav>
      )}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {ready && !P.welcomed && <Welcome />}
      {help && (
        <div className="overlay" onClick={() => setHelp(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Raccourcis clavier" onClick={(e) => e.stopPropagation()}>
            <h2>Raccourcis clavier</h2>
            <table>
              <tbody>
                {[
                  ["Alt + 1 … 6", "Apprendre, S'entraîner, Dictionnaire, Bibliothèque, Statistiques, Profil"],
                  ["Alt + H", "Tableau de bord"],
                  ["1 · 2 · 3 · 4", "Choisir une réponse (en exercice)"],
                  ["Entrée", "Valider / question suivante"],
                  ["Espace", "Retourner une carte"],
                  ["Échap", "Quitter la séance / fermer cette fenêtre"],
                  ["?", "Afficher cette aide"],
                ].map(([k, v]) => (
                  <tr key={k}><td style={{ width: "36%", font: "inherit" }}><kbd>{k}</kbd></td><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
            <button className="btn" onClick={() => setHelp(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

function Welcome() {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(30);
  const finish = () =>
    update((p) => {
      p.welcomed = true;
      p.settings.name = name.trim().slice(0, 24).replace(/[<>]/g, "");
      p.settings.goal = goal;
    });
  return (
    <div className="overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="wt">
        <p className="lab" aria-hidden="true">Étape {step + 1} / 3</p>
        {step === 0 && (
          <>
            <h2 id="wt">Bienvenue sur Galme</h2>
            <p>Cette plateforme t&apos;aide à apprendre le Galme avec un parcours par niveaux, des exercices variés, un dictionnaire complet et une bibliothèque de textes.</p>
            <p className="note">La langue est fixée : l&apos;application n&apos;utilise que le vocabulaire, les phrases et les règles existants. Quelques minutes par jour suffisent.</p>
            <button className="btn" onClick={() => setStep(1)}>Commencer</button>
          </>
        )}
        {step === 1 && (
          <>
            <h2 id="wt">Fais connaissance</h2>
            <label htmlFor="wn">Ton prénom ou pseudo (facultatif)</label>
            <input id="wn" type="text" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            <label htmlFor="wg">Objectif quotidien : {goal} réponses</label>
            <input id="wg" type="range" min={10} max={100} step={5} value={goal} onChange={(e) => setGoal(+e.target.value)} style={{ width: "100%" }} />
            <p className="note">Tu pourras tout modifier dans les paramètres.</p>
            <button className="btn" onClick={() => setStep(2)}>Continuer</button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 id="wt">Comment ça marche ?</h2>
            <p><b>📖 Apprendre</b> : cinq niveaux, des leçons, des examens.</p>
            <p><b>🎯 S&apos;entraîner</b> : exercices et jeux. <b>🔤 Dictionnaire</b> : une fiche par mot. <b>📚 Bibliothèque</b> : des textes à lire.</p>
            <p><b>📊 Statistiques</b> et <b>👤 Profil</b> : XP, badges, séries.</p>
            <button className="btn" onClick={finish}>C&apos;est parti !</button>
          </>
        )}
      </div>
    </div>
  );
}
