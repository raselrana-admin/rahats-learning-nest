"use client";

import { useState, type FormEvent } from "react";
import { LIMITS, SUBJECTS, type LearningLink, type SubjectId } from "@/lib/subjects";

type Props = {
  defaultSubject: SubjectId | null;
  onSaved: (link: LearningLink) => void;
};

const inputClass =
  "w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none";

export function LinkForm({ defaultSubject, onSaved }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<SubjectId | null>(defaultSubject);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return setError("Please paste or type the link first.");
    if (!title.trim()) return setError("Please give the link a title.");
    if (!subject) return setError("Please pick a subject.");

    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, subject, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save the link. Please try again.");
        return;
      }
      onSaved(data.link);
      setUrl("");
      setTitle("");
      setNote("");
    } catch {
      setError("No internet? Could not save the link. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="link-url" className="mb-1.5 block font-extrabold">
          Link
        </label>
        <input
          id="link-url"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          maxLength={LIMITS.url}
          placeholder="https://www.example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="link-title" className="mb-1.5 block font-extrabold">
          Title
        </label>
        <input
          id="link-title"
          type="text"
          autoComplete="off"
          maxLength={LIMITS.title}
          placeholder="What is this link about?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 font-extrabold">Subject</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {SUBJECTS.map((s) => {
            const checked = subject === s.id;
            return (
              <label
                key={s.id}
                data-subject={s.id}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                  checked
                    ? "border-subject bg-subject-soft text-subject-ink"
                    : "border-line bg-surface text-ink hover:border-subject"
                }`}
              >
                <input
                  type="radio"
                  name="subject"
                  value={s.id}
                  checked={checked}
                  onChange={() => {
                    setSubject(s.id);
                    setError(null);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-subject text-sm font-black text-white dark:text-black"
                >
                  {s.icon}
                </span>
                {s.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="link-note" className="mb-1.5 flex items-baseline justify-between font-extrabold">
          <span>
            Short note <span className="font-semibold text-muted">(optional)</span>
          </span>
          <span className="text-xs font-semibold text-muted" aria-hidden>
            {note.length}/{LIMITS.note}
          </span>
        </label>
        <textarea
          id="link-note"
          rows={2}
          maxLength={LIMITS.note}
          placeholder="Why is this link useful?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="min-h-12 w-full rounded-2xl bg-brand px-5 py-3 text-lg font-black text-brand-ink shadow-card transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save link"}
      </button>
    </form>
  );
}
