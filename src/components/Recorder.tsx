import { useEffect, useRef, useState } from 'react';
import { Check, Mic, Play, Square, Trash2, X } from 'lucide-react';
import { speak, stop, type Speech } from '../speech';
import { deleteRecording, saveRecording, useRecordings } from '../voice/recordings';

// Records one short clip with the microphone (a child's name or a letter
// sound), plays it back, and saves it on this device only.

const MAX_MS = 5000;

type State = { step: 'idle' } | { step: 'recording' } | { step: 'review'; blob: Blob } | { step: 'error'; message: string };

export function Recorder({
  title, hint, recKey, current, onClose,
}: {
  title: string;
  hint: string;
  recKey: string;
  current: Speech; // how this is said now, to compare
  onClose: () => void;
}) {
  const { has } = useRecordings();
  const [state, setState] = useState<State>({ step: 'idle' });
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const player = useRef<HTMLAudioElement | null>(null);

  const cleanup = () => {
    clearTimeout(timer.current);
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
    rec.current?.stream.getTracks().forEach(t => t.stop());
    player.current?.pause();
  };
  useEffect(() => cleanup, []);

  const start = async () => {
    stop();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState({ step: 'error', message: 'This browser cannot record sound. Try Safari on iPad or Chrome on Android.' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = e => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setState({ step: 'review', blob: new Blob(chunks, { type: r.mimeType || 'audio/mp4' }) });
      };
      rec.current = r;
      r.start();
      setState({ step: 'recording' });
      timer.current = setTimeout(() => r.state === 'recording' && r.stop(), MAX_MS);
    } catch {
      setState({ step: 'error', message: 'The microphone is blocked. Allow it for this site in the browser settings, then try again.' });
    }
  };

  const finish = () => {
    clearTimeout(timer.current);
    if (rec.current?.state === 'recording') rec.current.stop();
  };

  const playBlob = (blob: Blob) => {
    player.current?.pause();
    const a = new Audio(URL.createObjectURL(blob));
    player.current = a;
    a.play().catch(() => undefined);
  };

  const recording = state.step === 'recording';

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="panel dialog recorder" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="parent-note">{hint}</p>

        <div className="recorder-main">
          <button
            type="button"
            className={`mic-btn${recording ? ' on' : ''}`}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            onClick={recording ? finish : start}
          >
            {recording ? <Square size={44} strokeWidth={1.5} aria-hidden /> : <Mic size={48} strokeWidth={1.5} aria-hidden />}
          </button>
          <span className="parent-note">
            {recording ? 'Recording… tap to stop' : state.step === 'review' ? 'Listen, then save or record again' : 'Tap to record'}
          </span>
        </div>

        {state.step === 'error' && <p className="recorder-error">{state.message}</p>}

        <div className="actions">
          {state.step === 'review' ? (
            <>
              <button type="button" className="pill secondary small" onClick={() => playBlob(state.blob)}>
                <Play size={24} strokeWidth={1.5} aria-hidden /> Play
              </button>
              <button
                type="button"
                className="pill primary small"
                onClick={async () => {
                  await saveRecording(recKey, state.blob);
                  onClose();
                }}
              >
                <Check size={24} strokeWidth={1.5} aria-hidden /> Save
              </button>
            </>
          ) : (
            <>
              <button type="button" className="pill secondary small" onClick={() => speak(current)} disabled={recording}>
                <Play size={24} strokeWidth={1.5} aria-hidden /> Hear current
              </button>
              {has(recKey) && (
                <button
                  type="button"
                  className="pill secondary small"
                  disabled={recording}
                  onClick={async () => {
                    await deleteRecording(recKey);
                  }}
                >
                  <Trash2 size={24} strokeWidth={1.5} aria-hidden /> Remove mine
                </button>
              )}
            </>
          )}
          <button type="button" className="pill secondary small" onClick={onClose}>
            <X size={24} strokeWidth={1.5} aria-hidden /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
