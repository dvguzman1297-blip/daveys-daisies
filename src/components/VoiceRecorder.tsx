"use client";

import { Mic, Square, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_VOICE_BYTES, MAX_VOICE_SECONDS, normalizeVoiceMime, voiceExtension, voiceMimeOfFile } from "@/lib/voice";
import { formatTime } from "@/lib/youtube";
import type { VoiceDraft } from "@/types/bouquet";

interface VoiceRecorderProps {
  value: VoiceDraft | null;
  onChange: (next: VoiceDraft | null) => void;
  anonymous: boolean;
}

/** Best-supported first; Safari only does mp4, Chrome and Firefox do webm/ogg. */
const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

const draftOf = (blob: Blob, mime: string, seconds: number): VoiceDraft => ({
  blob,
  mime,
  seconds: Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.ceil(seconds))),
  previewUrl: URL.createObjectURL(blob),
});

/** Reads a file's length by loading its metadata; null if the browser can't decode it. */
function readDuration(file: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (seconds: number | null) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(seconds);
    };
    const timer = setTimeout(() => done(null), 8000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null);
    audio.onerror = () => done(null);
    audio.src = url;
  });
}

export function VoiceRecorder({ value, onChange, anonymous }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const discardRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Recording finishes after the render that started it, so keep the latest props handy.
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });

  const replace = (next: VoiceDraft | null) => {
    const { value: current, onChange: change } = latest.current;
    if (current) URL.revokeObjectURL(current.previewUrl);
    change(next);
  };

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Leaving the page mid-recording releases the microphone and drops the take.
  useEffect(
    () => () => {
      discardRef.current = true;
      stopTimer();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    },
    [],
  );

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording isn't supported in this browser. You can upload an audio file instead.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setError(
        denied
          ? "Microphone access is blocked. Allow it in your browser, or upload an audio file instead."
          : "We couldn't find a microphone. You can upload an audio file instead.",
      );
      return;
    }

    const preferred = RECORDER_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
    const chunks: Blob[] = [];
    const startedAt = performance.now();
    discardRef.current = false;

    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      stopTimer();
      setRecording(false);
      if (discardRef.current) return;
      const mime = normalizeVoiceMime(recorder.mimeType || preferred || "");
      const blob = new Blob(chunks, { type: mime });
      if (!voiceExtension(mime) || blob.size === 0) {
        setError("We couldn't capture that recording. Please try again or upload a file.");
      } else if (blob.size > MAX_VOICE_BYTES) {
        setError("That recording is too large. Try a shorter one.");
      } else {
        replace(draftOf(blob, mime, (performance.now() - startedAt) / 1000));
      }
    };

    recorderRef.current = recorder;
    recorder.start();
    setElapsed(0);
    setRecording(true);
    timerRef.current = window.setInterval(() => {
      const seconds = (performance.now() - startedAt) / 1000;
      setElapsed(Math.min(seconds, MAX_VOICE_SECONDS));
      if (seconds >= MAX_VOICE_SECONDS && recorder.state === "recording") recorder.stop();
    }, 200);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const mime = voiceMimeOfFile(file);
    if (!mime) return setError("Choose an audio file (MP3, M4A, WAV, WebM or OGG).");
    if (file.size > MAX_VOICE_BYTES) return setError(`That file is over ${MAX_VOICE_BYTES / 1024 / 1024} MB.`);
    setReading(true);
    const blob = file.slice(0, file.size, mime);
    const seconds = await readDuration(blob);
    setReading(false);
    if (seconds === null) return setError("We couldn't read that audio file. Try another one.");
    if (seconds > MAX_VOICE_SECONDS) {
      return setError(`That clip is ${formatTime(seconds)} long. Voice messages can be up to ${MAX_VOICE_SECONDS / 60} minutes.`);
    }
    replace(draftOf(blob, mime, seconds));
  };

  const buttonClass =
    "inline-flex items-center gap-2 rounded-full border border-sage-300 bg-white/80 px-4 py-2 text-sm font-bold text-sage-700 transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section aria-labelledby="voice-heading">
      <h3 id="voice-heading" className="mb-1 font-display text-lg text-ink">
        Voice message <span className="font-sans text-sm font-semibold text-ink-soft">Optional</span>
      </h3>
      <p className="mb-3 text-sm text-ink-soft">
        Say it out loud. They can play it after opening your letter. Record up to {MAX_VOICE_SECONDS / 60} minutes, or
        upload an audio file.
      </p>
      {anonymous && (
        <p className="mb-3 rounded-2xl bg-butter-100/70 p-3 text-sm text-ink-soft">
          <strong className="text-ink">You&apos;re sending anonymously.</strong> Your voice might give you away, so only
          add one if you don&apos;t mind them recognising it.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-full bg-blush-700 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700"
          >
            <Square className="size-4 fill-current" aria-hidden="true" />
            Stop
            <span className="tabular-nums" role="timer" aria-label="Recording time">
              {formatTime(elapsed)} / {formatTime(MAX_VOICE_SECONDS)}
            </span>
          </button>
        ) : (
          <button type="button" onClick={startRecording} disabled={reading} className={buttonClass}>
            <Mic className="size-4" aria-hidden="true" />
            {value ? "Record again" : "Record"}
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={recording || reading}
          className={buttonClass}
        >
          <Upload className="size-4" aria-hidden="true" />
          {reading ? "Reading file…" : "Upload a file"}
        </button>
        <input ref={fileRef} type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm,.aac" onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
      </div>

      {value && !recording && (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-sage-100 bg-white/70 p-3">
          <audio controls src={value.previewUrl} className="h-10 w-full" aria-label="Preview of your voice message" />
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>{formatTime(value.seconds)} long</span>
            <button
              type="button"
              onClick={() => replace(null)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold text-blush-700 transition hover:bg-blush-100 focus-visible:outline-2 focus-visible:outline-blush-500"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-blush-700">
          {error}
        </p>
      )}
    </section>
  );
}
