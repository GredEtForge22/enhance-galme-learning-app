"use client";

import { useEffect, useRef, useState } from "react";

export function Recorder() {
  const [recording, setRecording] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => () => {
    const r = recorder.current;
    if (r?.state === "recording") {
      r.onstop = null;
      r.stop();
    }
    stream.current?.getTracks().forEach((track) => track.stop());
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  async function start() {
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Enregistrement non pris en charge");
      }

      const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = currentStream;

      const currentRecorder = new MediaRecorder(currentStream);
      recorder.current = currentRecorder;
      chunks.current = [];

      currentRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };

      currentRecorder.onstop = () => {
        const blob = new Blob(
          chunks.current,
          currentRecorder.mimeType ? { type: currentRecorder.mimeType } : undefined,
        );

        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        const url = URL.createObjectURL(blob);
        objectUrl.current = url;
        setSrc(url);

        currentStream.getTracks().forEach((track) => track.stop());
        stream.current = null;
        setRecording(false);
      };

      currentRecorder.start();
      setRecording(true);
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setError("Micro indisponible ou autorisation refusée.");
    }
  }

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  return (
    <section className="box">
      <button className="btn" type="button" onClick={recording ? stop : start}>
        {recording ? "Arrêter l’enregistrement" : "Enregistrer ma réponse"}
      </button>

      {error && <p role="alert">{error}</p>}
      {src && <audio controls src={src} />}
    </section>
  );
}
