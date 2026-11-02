import { APP_VERSION } from "@/data/galme";

export const metadata = { title: "Crédits" };

export default function Credits() {
  return (
    <>
      <h1>Crédits</h1>
      <section className="box">
        <h2>La langue</h2>
        <p>Le Galme — son vocabulaire, ses phrases et ses règles — est l&apos;œuvre de ses créateurs. Cette plateforme ne le modifie pas : les données linguistiques sont isolées dans un module dédié, repris à l&apos;identique du projet d&apos;origine.</p>
      </section>
      <section className="box">
        <h2>Le projet</h2>
        <p>Basée sur le projet « Galme-apprentissage » (GredEtForge22), une application d&apos;une seule page transformée en plateforme complète : parcours, exercices, dictionnaire, bibliothèque, statistiques, profil et communauté.</p>
      </section>
      <section className="box">
        <h2>Outils</h2>
        <ul>
          <li>Next.js, React et TypeScript</li>
          <li>PostgreSQL et Drizzle ORM (comptes, synchronisation, classements)</li>
          <li>Polices Figtree et Young Serif (licence SIL OFL)</li>
        </ul>
      </section>
      <p className="foot">Galme · version {APP_VERSION}</p>
    </>
  );
}
