import Link from "next/link";

export const metadata = { title: "Comment fonctionne l'apprentissage" };

export default function Fonctionnement() {
  return (
    <>
      <h1>Comment fonctionne l&apos;apprentissage</h1>
      <p className="mu">Une méthode simple : peu de temps chaque jour, des révisions espacées et des exercices variés.</p>

      <section className="box">
        <h2>1. La répétition espacée</h2>
        <p>Chaque mot ou phrase a un niveau de mémorisation de 0 à 5. Une bonne réponse le fait monter et repousse sa prochaine révision : <b>1, 2, 4, 8 puis 16 jours</b>. Une erreur le ramène à zéro pour qu&apos;il revienne tout de suite.</p>
        <ul>
          <li><b>Découvert</b> : vu mais pas encore réussi.</li>
          <li><b>En cours</b> : niveau 1 à 3.</li>
          <li><b>Maîtrisé</b> : niveau 4 ou 5.</li>
        </ul>
      </section>

      <section className="box">
        <h2>2. Le parcours</h2>
        <p>Cinq niveaux — Débutant, Élémentaire, Intermédiaire, Avancé, Expert — regroupent les leçons. Chaque leçon propose les règles, le vocabulaire, des exemples interactifs, un quiz et des exercices. Elle est <b>terminée</b> quand le quiz (60 %) et les exercices (70 %) sont réussis. Un examen de 20 questions chronométrées (80 % requis) valide chaque niveau.</p>
      </section>

      <section className="box">
        <h2>3. La séance du jour</h2>
        <p>Elle réunit les mots à réviser, quelques nouveaux mots (dans l&apos;ordre du parcours) et des exercices d&apos;association. Fixe-toi un objectif quotidien dans les <Link href="/parametres">paramètres</Link>.</p>
      </section>

      <section className="box">
        <h2>4. S&apos;entraîner autrement</h2>
        <p>Dictées, traductions dans les deux sens, textes à trous, grammaire, terminaisons, particules, correction de phrases, mais aussi des jeux : contre-la-montre, survie, marathon, sans faute, défi quotidien. Les erreurs sont mémorisées pour une <b>révision ciblée</b>.</p>
      </section>

      <section className="box">
        <h2>5. XP, niveaux et badges</h2>
        <p>Chaque bonne réponse rapporte 10 XP. Des bonus récompensent l&apos;objectif du jour (+25), une séance parfaite (+20), une leçon terminée (+50), un examen réussi (+100), le défi quotidien (+40) et chaque badge (+25). Tes XP font monter ton niveau d&apos;apprenant.</p>
      </section>

      <section className="box">
        <h2>Une langue qui ne change pas</h2>
        <p>Cette application n&apos;ajoute et ne modifie aucun mot ni aucune règle du Galme : elle n&apos;exploite que le dictionnaire, les phrases, les règles et les exemples existants.</p>
      </section>
    </>
  );
}
