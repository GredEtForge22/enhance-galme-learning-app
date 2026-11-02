"use client";
import Link from "next/link";
import { useState } from "react";
import { AFF_LABEL, analyze, tokens } from "@/data/galme";
import { STATUS_LABEL, type Status } from "@/lib/stats";

export function Bar({ pct, kind = "" }: { pct: number; kind?: "" | "g" | "a" }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className={`bar ${kind}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: v + "%" }} />
    </div>
  );
}

export function StatusTag({ s }: { s: Status }) {
  return <span className={`tag ${s}`}>{STATUS_LABEL[s]}</span>;
}

export function Stat({ v, l, warm }: { v: string | number; l: string; warm?: boolean }) {
  return (
    <div className={`st ${warm ? "warm" : ""}`}>
      <b>{v}</b>
      {l}
    </div>
  );
}

/** Phrase interactive : chaque mot est cliquable et affiche sa décomposition (racine + affixes). */
export function Sentence({ g, f, hidden = false }: { g: string; f?: string; hidden?: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  const [show, setShow] = useState(!hidden);
  return (
    <div>
      <div className="sent" lang="x-galme">
        {tokens(g).map((t, i) =>
          t === "?" ? (
            <span key={i}>?</span>
          ) : (
            <button key={i} className={`tokb ${sel === t + i ? "on" : ""}`} onClick={() => setSel(sel === t + i ? null : t + i)} aria-label={`Mot ${t}`}>
              {t}
            </button>
          ),
        )}
      </div>
      {f && (
        <p className="note" style={{ margin: "4px 0 0" }}>
          {show ? f : (
            <button className="chip" onClick={() => setShow(true)}>Afficher la traduction</button>
          )}
        </p>
      )}
      {sel && (
        <div className="pop" role="note">
          {(() => {
            const tok = tokens(g).find((t, i) => t + i === sel) || "";
            const x = analyze(tok);
            return (
              <>
                <b>{tok.replace(/[,?]+$/, "")}</b>
                {x.aff.length > 0 && <> : {x.aff.map((af) => `${af} (${AFF_LABEL[af]})`).join(" + ")}</>}
                {x.entry ? (
                  <>
                    {" "}→ <b>{x.entry.g}</b> = {x.entry.f}{" "}
                    <Link href={`/dictionnaire/${x.entry.id}`}>Fiche</Link>
                  </>
                ) : (
                  <span className="mu"> · {x.aff.length ? `racine « ${x.base} » absente du dictionnaire` : "mot absent du dictionnaire"}</span>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

type BarDatum = { label: string; v: number; v2?: number };
/** Histogramme SVG : barres = total, surcouche = bonnes réponses. */
export function BarChart({ data, unit = "", h = 140 }: { data: BarDatum[]; unit?: string; h?: number }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  const w = Math.max(data.length * 44, 280);
  const bw = Math.min(30, (w / data.length) * 0.6);
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h + 28}`} role="img" aria-label={`Graphique : ${data.map((d) => `${d.label} ${d.v}${unit}`).join(", ")}`}>
      {data.map((d, i) => {
        const x = (i + 0.5) * (w / data.length);
        const bh = (d.v / max) * (h - 18);
        const bh2 = d.v2 !== undefined ? (d.v2 / max) * (h - 18) : 0;
        return (
          <g key={i}>
            <rect x={x - bw / 2} y={h - bh} width={bw} height={Math.max(bh, d.v ? 2 : 0)} rx={4} fill="var(--ac2)" opacity={d.v2 !== undefined ? 0.35 : 1} />
            {d.v2 !== undefined && <rect x={x - bw / 2} y={h - bh2} width={bw} height={bh2} rx={4} fill="var(--ok)" />}
            <text x={x} y={h - bh - 4} textAnchor="middle" fontSize="11" fill="var(--mu)">{d.v || ""}</text>
            <text x={x} y={h + 16} textAnchor="middle" fontSize="11" fill="var(--mu)">{d.label}</text>
          </g>
        );
      })}
      <line x1="0" x2={w} y1={h} y2={h} stroke="var(--bd)" />
    </svg>
  );
}
