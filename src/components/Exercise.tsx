"use client";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/questions";
import { norm, shuf } from "@/lib/text";
import {
  matchGalmeAnswer,
  type GalmeAnswerMatch,
} from "@/lib/galme-answer";

export type Result = { ok: boolean; errs?: number[]; good?: string };
type Q<T extends Question["type"]> = Extract<Question, { type: T }>;
type Props<T extends Question["type"]> = { q: Q<T>; onResult: (r: Result) => void; keys: boolean };

export const goodOf = (q: Question): string => {
  switch (q.type) {
    case "choice": case "typed": case "order": case "gaps": case "multi": return q.good;
    case "flip": return q.reveal;
    default: return "";
  }
};

export function QuestionView({ q, onResult, keys }: { q: Question; onResult: (r: Result) => void; keys: boolean }) {
  switch (q.type) {
    case "choice": return <Choice q={q} onResult={onResult} keys={keys} />;
    case "typed": return <Typed q={q} onResult={onResult} keys={keys} />;
    case "order": return <Order q={q} onResult={onResult} keys={keys} />;
    case "flip": return <Flip q={q} onResult={onResult} keys={keys} />;
    case "match": return <Match q={q} onResult={onResult} keys={keys} />;
    case "gaps": return <Gaps q={q} onResult={onResult} keys={keys} />;
    case "multi": return <Multi q={q} onResult={onResult} keys={keys} />;
    default: return null;
  }
}

const size = (s: string) => (s.length > 14 ? "s" : "");

function Choice({ q, onResult, keys }: Props<"choice">) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    if (!keys || picked !== null) return;
    const h = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || !/^[1-9]$/.test(e.key)) return;
      const o = q.opts[+e.key - 1];
      if (o) {
        setPicked(o.key);
        onResult({ ok: o.key === q.answer });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [q, keys, picked, onResult]);
  const choose = (k: string) => {
    if (picked !== null) return;
    setPicked(k);
    onResult({ ok: k === q.answer });
  };
  return (
    <>
      <p className="lab">{q.label}</p>
      {q.ctx && <div className="q-ctx">{q.ctx.map((l, i) => <div key={i}>{l}</div>)}</div>}
      <div className={`big ${size(q.prompt)}`}>{q.prompt}</div>
      {q.sub && <p className="lab" style={{ fontSize: 19, color: "var(--tx)" }}>{q.sub}</p>}
      {q.opts.map((o, i) => (
        <button key={o.key} className={`ch ${picked !== null ? (o.key === q.answer ? "ok" : o.key === picked ? "ko" : "") : ""}`} disabled={picked !== null} onClick={() => choose(o.key)}>
          {keys && i < 9 && <span className="kb" aria-hidden="true">{i + 1}</span>}
          {o.text}
        </button>
      ))}
    </>
  );
}

function Typed({ q, onResult }: Props<"typed">) {
  const [v, setV] = useState("");
  const [phase, setPhase] = useState<
    "flash" | "in" | "done"
  >(q.flash ? "flash" : "in");

  const [answerMatch, setAnswerMatch] =
    useState<GalmeAnswerMatch>(null);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "flash" && q.flash) {
      const t = setTimeout(
        () => setPhase("in"),
        q.flash.ms,
      );

      return () => clearTimeout(t);
    }

    if (phase === "in") {
      ref.current?.focus();
    }
  }, [phase, q]);

  const check = () => {
    if (phase !== "in") return;

    const result = matchGalmeAnswer(
      v,
      q.answers,
    );

    setAnswerMatch(result);
    setPhase("done");

    onResult({
      ok: result !== null,
    });
  };

  return (
    <>
      <p className="lab">{q.label}</p>

      <div className={`big ${size(q.prompt)}`}>
        {q.prompt}
      </div>

      {q.hint && (
        <p className="note">{q.hint}</p>
      )}

      {phase === "flash" && q.flash && (
        <div role="status">
          <div
            className="flash"
            lang="x-galme"
          >
            {q.flash.text}
          </div>

          <p className="lab">
            Mémorise… le mot va disparaître.
          </p>

          <button
            className="btn alt"
            onClick={() => setPhase("in")}
          >
            Je suis prêt
          </button>
        </div>
      )}

      {phase !== "flash" && (
        <>
          <input
            ref={ref}
            type="text"
            value={v}
            onChange={(e) =>
              setV(e.target.value)
            }
            disabled={phase === "done"}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Ta réponse en galme"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                check();
              }
            }}
          />

          {phase === "in" && (
            <button
              className="btn"
              onClick={check}
            >
              Valider
            </button>
          )}

          {phase === "done" &&
            answerMatch === "variant" && (
              <p
                className="fb ok"
                role="status"
              >
                {q.sent
                  ? "Forme du corpus"
                  : "Forme du dictionnaire"}{" "}
                :{" "}
                <span lang="x-galme">
                  {q.good}
                </span>
              </p>
            )}
        </>
      )}
    </>
  );
}


function Order({ q, onResult }: Props<"order">) {
  const [ord] = useState(() => shuf(q.tokens.map((_, i) => i)));
  const [pickd, setPickd] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const check = () => {
    if (pickd.length < q.tokens.length || done) return;
    setDone(true);
    onResult({ ok: norm(pickd.map((i) => q.tokens[i]).join("")) === norm(q.good) });
  };
  return (
    <>
      <p className="lab">{q.label}</p>
      <div className="big s">{q.prompt}</div>
      <div className="big s" style={{ minHeight: 44, borderBottom: "2px dashed var(--bd)" }} aria-live="polite">{pickd.map((i) => q.tokens[i]).join(" ")}</div>
      <div>
        {ord.filter((i) => !pickd.includes(i)).map((i) => (
          <button key={i} className="ch" style={{ display: "inline-block", width: "auto", margin: 4 }} disabled={done} onClick={() => setPickd([...pickd, i])}>{q.tokens[i]}</button>
        ))}
      </div>
      {!done && (
        <>
          <button className="btn" onClick={check} disabled={pickd.length < q.tokens.length}>Valider</button>
          <button className="btn alt" onClick={() => setPickd([])}>Effacer</button>
        </>
      )}
    </>
  );
}

function Flip({ q, onResult, keys }: Props<"flip">) {
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!keys || shown) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === " " && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setShown(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [keys, shown]);
  const ans = (ok: boolean) => {
    setDone(true);
    onResult({ ok });
  };
  return (
    <>
      <p className="lab">{q.label}</p>
      <div className={`big ${size(q.prompt)}`}>{q.prompt}</div>
      {!shown ? (
        <button className="btn" onClick={() => setShown(true)}>Voir la réponse <span className="kb" aria-hidden="true" style={{ opacity: 0.7 }}>espace</span></button>
      ) : (
        <>
          <div className="big s" style={{ color: "var(--ac)" }} role="status">{q.reveal}</div>
          <button className="ch" disabled={done} onClick={() => ans(true)}>Je savais</button>
          <button className="ch" disabled={done} onClick={() => ans(false)}>À revoir</button>
        </>
      )}
    </>
  );
}

function Match({ q, onResult }: Props<"match">) {
  const [right] = useState(() => shuf(q.pairs));
  const [sel, setSel] = useState<{ s: "g" | "f"; i: number } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [errs, setErrs] = useState<number[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const click = (s: "g" | "f", id: number) => {
    if (done.includes(id)) return;
    if (!sel || sel.s === s) return setSel({ s, i: id });
    if (sel.i === id) {
      const nd = [...done, id];
      setDone(nd);
      setSel(null);
      if (nd.length === q.pairs.length) onResult({ ok: errs.length === 0, errs });
    } else {
      setErrs([...new Set([...errs, sel.i, id])]);
      setBad([`${sel.s}${sel.i}`, `${s}${id}`]);
      setSel(null);
      setTimeout(() => setBad([]), 500);
    }
  };
  const cls = (s: "g" | "f", id: number) => `ch ${done.includes(id) ? "ok" : bad.includes(s + id) ? "ko" : sel?.s === s && sel.i === id ? "sel" : ""}`;
  return (
    <>
      <p className="lab">{q.label}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <div>{q.pairs.map((p) => <button key={p.id} className={cls("g", p.id)} disabled={done.includes(p.id)} onClick={() => click("g", p.id)}>{p.g}</button>)}</div>
        <div>{right.map((p) => <button key={p.id} className={cls("f", p.id)} disabled={done.includes(p.id)} onClick={() => click("f", p.id)}>{p.f}</button>)}</div>
      </div>
    </>
  );
}

function Gaps({ q, onResult }: Props<"gaps">) {
  const [vals, setVals] = useState<string[]>(() => q.answers.map(() => ""));
  const [done, setDone] = useState(false);
  const res = q.answers.map((a, i) => norm(vals[i]) === norm(a));
  const check = () => {
    if (done) return;
    setDone(true);
    onResult({ ok: res.every(Boolean) });
  };
  return (
    <>
      <p className="lab">{q.label}</p>
      <div className="q-ctx" style={{ marginTop: 14 }}>
        {q.lines.map((l, li) => (
          <div key={li} style={{ marginBottom: 8 }}>
            {l.parts.map((p, pi) =>
              "s" in p ? (
                <span key={pi}>{p.s} </span>
              ) : (
                <span key={pi}>
                  <select aria-label={`Trou ${p.g + 1}`} value={vals[p.g]} disabled={done} onChange={(e) => setVals(vals.map((x, k) => (k === p.g ? e.target.value : x)))} style={{ borderColor: done ? (res[p.g] ? "var(--ok)" : "var(--ko)") : undefined, background: "var(--bg)", color: "var(--tx)", border: "2px solid var(--bd)", borderRadius: 8 }}>
                    <option value="">…</option>
                    {q.bank.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {p.p}{" "}
                </span>
              ),
            )}
            <div className="note" style={{ fontFamily: "var(--sans)", fontSize: 14 }}>{l.fr}</div>
          </div>
        ))}
      </div>
      {!done && <button className="btn" onClick={check} disabled={vals.some((v) => !v)}>Valider</button>}
    </>
  );
}

function Multi({ q, onResult }: Props<"multi">) {
  const [vals, setVals] = useState<string[]>(
    () => q.rows.map(() => ""),
  );

  const [done, setDone] = useState(false);

  const matches = q.rows.map((r, i) =>
    matchGalmeAnswer(
      vals[i],
      [r.g],
    ),
  );

  const res = matches.map(
    (match) => match !== null,
  );

  const check = () => {
    if (done) return;

    setDone(true);

    onResult({
      ok:
        res.filter(Boolean).length /
          q.rows.length >=
        0.8,
    });
  };

  return (
    <>
      <p className="lab">{q.label}</p>

      {q.hint && (
        <p className="note">{q.hint}</p>
      )}

      {q.rows.map((r, i) => (
        <div
          key={i}
          style={{ marginTop: 12 }}
        >
          <div
            className="note"
            style={{ color: "var(--tx)" }}
          >
            {i + 1}. {r.fr}
          </div>

          <input
            type="text"
            value={vals[i]}
            disabled={done}
            aria-label={`Traduction de la ligne ${i + 1}`}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) =>
              setVals(
                vals.map((x, k) =>
                  k === i
                    ? e.target.value
                    : x,
                ),
              )
            }
            style={{
              borderColor: done
                ? res[i]
                  ? "var(--ok)"
                  : "var(--ko)"
                : undefined,
            }}
          />

          {done &&
            matches[i] === "variant" && (
              <div
                className="fb ok"
                style={{
                  margin: "2px 0 0",
                  fontSize: 14,
                }}
              >
                Forme du corpus :{" "}
                <span lang="x-galme">
                  {r.g}
                </span>
              </div>
            )}

          {done && !res[i] && (
            <div
              className="fb ko"
              style={{
                margin: "2px 0 0",
                fontSize: 14,
              }}
            >
              → {r.g}
            </div>
          )}
        </div>
      ))}

      {!done && (
        <button
          className="btn"
          onClick={check}
        >
          Valider
        </button>
      )}
    </>
  );
}
