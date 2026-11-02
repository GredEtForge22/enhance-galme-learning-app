import { Suspense } from "react";
import { JouerClient } from "./JouerClient";

export const metadata = { title: "Séance" };

export default function Page() {
  return (
    <Suspense fallback={<p className="mu">Chargement…</p>}>
      <JouerClient />
    </Suspense>
  );
}
