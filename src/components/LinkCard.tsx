"use client";

import { getSubject, type LearningLink } from "@/lib/subjects";

type Props = {
  link: LearningLink;
  busy: boolean;
  onToggleLearned: (link: LearningLink) => void;
  onRemove: (link: LearningLink) => void;
};

export function siteName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function LinkCard({ link, busy, onToggleLearned, onRemove }: Props) {
  const subject = getSubject(link.subject);

  return (
    <article
      data-subject={subject.id}
      className="pop-in group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card"
    >
      <div aria-hidden className={`h-2 ${link.learned ? "bg-line" : "bg-subject"}`} />

      <div
        className={`flex flex-1 flex-col gap-3 p-4 transition-opacity sm:p-5 ${
          link.learned ? "opacity-55 group-hover:opacity-100 group-focus-within:opacity-100" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-subject-soft px-3 py-1 text-sm font-extrabold text-subject-ink">
            <span aria-hidden>{subject.icon}</span>
            {subject.label}
          </span>
          {link.learned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-3 py-1 text-sm font-extrabold text-good">
              ✓ Learned
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl leading-snug font-black">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words underline-offset-4 hover:underline"
            >
              {link.title}
              <span aria-hidden className="ml-1 inline-block text-base text-muted">
                ↗
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h3>
          <p className="mt-0.5 truncate text-sm font-bold text-subject-ink">{siteName(link.url)}</p>
        </div>

        {link.note && <p className="break-words text-ink/85">{link.note}</p>}

        <p className="mt-auto text-sm text-muted">Saved on {dateFormat.format(new Date(link.created_at))}</p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleLearned(link)}
            className={`min-h-11 flex-1 rounded-2xl px-4 py-2 font-extrabold transition active:scale-95 disabled:opacity-60 ${
              link.learned
                ? "border-2 border-line bg-surface text-ink hover:bg-surface-2"
                : "bg-good text-good-ink hover:brightness-110"
            }`}
          >
            {link.learned ? "↩ Study again" : "✓ Learned"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(link)}
            className="min-h-11 rounded-2xl border-2 border-line bg-surface px-4 py-2 font-extrabold text-danger transition hover:border-danger hover:bg-danger-soft active:scale-95 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
