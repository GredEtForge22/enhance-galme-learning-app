"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Memory } from "@/components/Memory";
import { Runner } from "@/components/Runner";
import { buildSession } from "@/lib/sessions";
import { useStore } from "@/lib/store";

export function JouerClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const { P } = useStore();
  const [round, setRound] = useState(0);
  const mode = sp.get("mode") || "";
  const rawBack = sp.get("back") || "/s-entrainer";
  const back = rawBack.startsWith("/") && !rawBack.startsWith("//") ? rawBack : "/s-entrainer";
  const backLabel = back.startsWith("/apprendre") ? "Retour au parcours" : back.startsWith("/bibliotheque") ? "Retour au texte" : back.startsWith("/dictionnaire") ? "Retour à la fiche" : "Retour";

  // La configuration est figée au démarrage de chaque manche (la progression évolue pendant la séance).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cfg = useMemo(() => (mode === "memo" ? null : buildSession(mode, sp, P)), [mode, sp, round]);

  if (mode === "memo") return <Memory onExit={() => router.push(back)} />;
  if (!cfg) {
    return (
      <div className="box">
        <h2>Séance introuvable</h2>
        <p className="mu">Ce mode d&apos;exercice n&apos;existe pas ou ses paramètres sont invalides.</p>
        <Link className="btn" href="/s-entrainer">Retour</Link>
      </div>
    );
  }
  if (!cfg.items.length && !cfg.gen) {
    return (
      <div className="box">
        <h2>{cfg.title}</h2>
        <p className="mu">{cfg.empty ?? "Rien à travailler pour l'instant."}</p>
        <Link className="btn" href="/jouer?mode=aleatoire">S&apos;entraîner quand même</Link>
        <Link className="btn alt" href={back}>{backLabel}</Link>
      </div>
    );
  }
  return <Runner key={`${mode}-${round}`} cfg={cfg} back={back} backLabel={backLabel} onAgain={() => setRound((r) => r + 1)} />;
}
