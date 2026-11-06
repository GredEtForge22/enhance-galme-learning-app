import Link from "next/link";
import { Recorder } from "@/components/Recorder";

export default function ParlerPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <p>
        <Link href="/s-entrainer">← Retour à S’entraîner</Link>
      </p>

      <h1>Expression orale</h1>

      <section style={{ margin: "16px 0" }}>
        <h2>Consigne</h2>
        <p>Présente-toi en Galme : dis bonjour, puis ton prénom.</p>
        <p>
          Exemple : <strong>zhoyama, ena kala Sacha</strong>
          <br />
          <em>(bonjour, je m’appelle Sacha)</em>
        </p>
      </section>

      <Recorder />

      <section style={{ marginTop: 24 }}>
        <h2>Réécoute-toi et vérifie</h2>
        <ul>
          <li>Ai-je bien dit bonjour ?</li>
          <li>Ai-je dit mon prénom avec la bonne formule ?</li>
          <li>Ma prononciation est-elle claire ? Quels sons dois-je retravailler ?</li>
        </ul>
        <p>Si ce n’est pas encore ça, enregistre-toi à nouveau.</p>
      </section>
    </main>
  );
}
