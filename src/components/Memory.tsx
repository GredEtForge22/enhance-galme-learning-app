"use client";
import { useState } from "react";
import { words } from "@/data/galme";
import { useStore } from "@/lib/store";
import { day, shuf } from "@/lib/text";

type Card = { i: number; t: string };

function Game({ n, onN, onExit }: { n: number; onN: (n: number) => void; onExit: () => void }) {
  const { update } = useStore();
  const [cards] = useState<Card[]>(() => shuf(shuf(words).slice(0, n).flatMap((c) => [{ i: c.id, t: c.g }, { i: c.id, t: c.f }])));
  const [shown, setShown] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [first, setFirst] = useState<number | null>(null);
  const won = found.length === n;

  const flip = (k: number) => {
    if (lock || found.includes(cards[k].i) || shown.includes(k)) return;
    const ns = [...shown, k];
    setShown(ns);
    if (first === null) return setFirst(k);
    setMoves((m) => m + 1);
    if (cards[first].i === cards[k].i) {
      const nf = [...found, cards[k].i];
      setFound(nf);
      setShown([]);
      setFirst(null);
      if (nf.length === n)
        update((p) => {
          const d = p.days[day()] || (p.days[day()] = { a: 0, c: 0, s: 0, x: 0 });
          d.a += n; d.c += n; d.x += n * 3; p.xp += n * 3;
        });
    } else {
      setLock(true);
      setTimeout(() => { setShown([]); setFirst(null); setLock(false); }, 900);
    }
  };

  return (
    <>
      <h1>Mémory</h1>
      <p className="mu">Retrouve les paires galme / français.</p>
      <div className="row" role="group" aria-label="Nombre de paires">
        {[6, 10, 15, 20].map((k) => <button key={k} className={`chip ${k === n ? "on" : ""}`} onClick={() => onN(k)}>{k} paires</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${n > 6 ? 4 : 3}, 1fr)`, gap: 8, marginTop: 12 }}>
        {cards.map((c, k) => {
          const open = shown.includes(k) || found.includes(c.i);
          return (
            <button key={k} className={`ch ${found.includes(c.i) ? "ok" : ""}`} disabled={found.includes(c.i)} onClick={() => flip(k)} aria-label={open ? c.t : "Carte cachée"} style={{ minHeight: 64, textAlign: "center", padding: 6, fontSize: n > 6 ? 14 : 16, overflowWrap: "anywhere", marginTop: 0 }}>
              {open ? c.t : "?"}
            </button>
          );
        })}
      </div>
      <p className="lab" style={{ marginTop: 10 }} role="status">{moves} coups · {found.length}/{n} paires</p>
      {won && <p className="fb ok" role="status">Bravo : {moves} coups.</p>}
      <button className="btn alt" onClick={() => onN(n)}>Rejouer</button>
      <button className="btn alt" onClick={onExit}>Retour</button>
    </>
  );
}

export function Memory({ onExit }: { onExit: () => void }) {
  const [n, setN] = useState(10);
  const [round, setRound] = useState(0);
  return <Game key={`${n}-${round}`} n={n} onN={(k) => { setN(k); setRound((r) => r + 1); }} onExit={onExit} />;
}
