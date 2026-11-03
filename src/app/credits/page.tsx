import { APP_VERSION } from "@/data/galme";

export const metadata = { title: "Crédits" };

export default function Credits() {
  return (
    <>
      <h1>Crédits</h1>
      <section className="box">
        <h2>La langue</h2>
        <p>Le Galme — son vocabulaire, ses phrases et ses règles — est l&apos;œuvre de Inochandess Lunitola. Cette plateforme ne le modifie pas : les données linguistiques sont isolées dans un module dédié, repris à l&apos;identique des indications de Inochandess Lunitola.</p>
      </section>
      <section className="box">
        <h2>Le projet</h2>
        <p>Le site internet a été créé par Sax le Breton, dit Gred et Forge avec l'aide de l'IA Claude.</p>
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
