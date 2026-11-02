import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Galme · plateforme d'apprentissage", template: "%s · Galme" },
  description: "Apprendre le Galme : parcours par niveaux, exercices, dictionnaire, bibliothèque et statistiques.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Applique le thème avant le premier rendu pour éviter tout flash.
const themeInit = `try{var t=localStorage.getItem("galme3-theme");if(t&&t!=="auto")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Young+Serif&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
