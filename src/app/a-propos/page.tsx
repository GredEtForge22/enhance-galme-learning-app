import Link from "next/link";
import { C, LESSONS, TEXTS, APP_VERSION } from "@/data/galme";

export const metadata = { title: "À propos" };

export default function APropos() {
  return (
    <>
      <h1>À propos de Galme</h1>
      <p className="mu">Plateforme d&apos;apprentissage du Galme · version {APP_VERSION}</p>

      <section className="box">
        <h2>Qu&apos;est-ce que c&apos;est ?</h2>
        <p>Galme est une plateforme pour apprendre le Galme à son rythme : un parcours progressif, des exercices variés, un dictionnaire détaillé, une bibliothèque de textes et un suivi précis de ta progression.</p>
        <div className="stats four" style={{ marginBottom: 0 }}>
          <div className="st"><b>{C.length}</b>entrées</div>
          <div className="st warm"><b>{LESSONS.length}</b>leçons</div>
          <div className="st"><b>5</b>niveaux</div>
          <div className="st warm"><b>{TEXTS.length}</b>textes</div>
        </div>
      </section>

      <section className="box">
        <h2>Les six espaces</h2>
        <ul>
          <li><b>Apprendre</b> — parcours, niveaux et leçons.</li>
          <li><b>S&apos;entraîner</b> — exercices et jeux.</li>
          <li><b>Dictionnaire</b> — vocabulaire et fiches.</li>
          <li><b>Bibliothèque</b> — textes à lire et à travailler.</li>
          <li><b>Statistiques</b> — progression et résultats.</li>
          <li><b>Profil</b> — XP, badges, paramètres et communauté.</li>
        </ul>
        <p><Link href="/fonctionnement">Comment fonctionne l&apos;apprentissage ?</Link></p>
      </section>

      <section className="box">
        <h2>Tes données</h2>
        <p>Ta progression est enregistrée sur ton appareil et peut être exportée à tout moment. Un compte est facultatif : il sert uniquement à synchroniser tes appareils et à participer à la communauté.</p>
      </section>
    </>
  );
}
