"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSubject, SUBJECTS, type LearningLink, type SubjectId } from "@/lib/subjects";
import { ConfirmDelete } from "./ConfirmDelete";
import { LinkCard, siteName } from "./LinkCard";
import { LinkForm } from "./LinkForm";
import { NestLogo } from "./NestLogo";
import { ThemeToggle } from "./ThemeToggle";

type Filter = SubjectId | "all";
type Status = "loading" | "ready" | "error";

function sortLinks(links: LearningLink[]) {
  // Links still to study come first (newest on top); learned links go to the bottom.
  return [...links].sort((a, b) => {
    if (a.learned !== b.learned) return a.learned ? 1 : -1;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function LearningNest() {
  const [links, setLinks] = useState<LearningLink[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<LearningLink | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const busyCount = useRef(0);

  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setStatus("loading");
    try {
      const res = await fetch("/api/links", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Skip a background refresh if a change is still being saved, so it is not undone on screen.
      if (quiet && busyCount.current > 0) return;
      setLinks(data.links);
      setStatus("ready");
    } catch {
      if (!quiet) setStatus("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load of the saved links
    load();
    // Fetch again when Rahat comes back to the page, so links added on another device show up.
    const refresh = () => {
      if (document.visibilityState === "visible") load(true);
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);

  function setBusy(id: string, busy: boolean) {
    busyCount.current += busy ? 1 : -1;
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSaved(link: LearningLink) {
    setLinks((prev) => [link, ...prev]);
    setQuery("");
    if (filter !== "all" && filter !== link.subject) setFilter("all");
    showToast("Saved! 🎉");
  }

  async function toggleLearned(link: LearningLink) {
    const learned = !link.learned;
    setBusy(link.id, true);
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, learned } : l)));
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learned }),
      });
      if (res.status === 404) {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
        showToast("That link was already removed.");
        return;
      }
      if (!res.ok) throw new Error();
      showToast(learned ? "Well done! ⭐" : "Moved back to study.");
    } catch {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, learned: link.learned } : l)));
      showToast("Could not save. Please try again.");
    } finally {
      setBusy(link.id, false);
    }
  }

  async function removeLink(link: LearningLink) {
    setToDelete(null);
    setBusy(link.id, true);
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error();
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      showToast("Link removed.");
    } catch {
      showToast("Could not remove. Please try again.");
    } finally {
      setBusy(link.id, false);
    }
  }

  const ready = status === "ready";
  const learnedCount = links.filter((l) => l.learned).length;
  const leftCount = links.length - learnedCount;
  const progress = links.length ? Math.round((learnedCount / links.length) * 100) : 0;

  const countBySubject = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of links) counts[l.subject] = (counts[l.subject] ?? 0) + 1;
    return counts;
  }, [links]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortLinks(links).filter((l) => {
      if (filter !== "all" && l.subject !== filter) return false;
      if (!q) return true;
      return [l.title, l.note ?? "", siteName(l.url), getSubject(l.subject).label]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [links, filter, query]);

  const filterLabel = filter === "all" ? "all subjects" : getSubject(filter).label;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-24 sm:px-6 sm:pt-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <NestLogo className="size-12 shrink-0 sm:size-14" />
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-black sm:text-4xl">Rahat&rsquo;s Learning Nest</h1>
            <p className="text-sm font-semibold text-muted sm:text-base">All my learning links in one place</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <section aria-label="Your progress" className="mt-6 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <dl className="grid grid-cols-3 gap-2 text-center sm:gap-4">
          <Stat label="Links saved" value={ready ? links.length : null} tone="brand" />
          <Stat label="Learned" value={ready ? learnedCount : null} tone="good" />
          <Stat label="Left to study" value={ready ? leftCount : null} tone="study" />
        </dl>
        <div className="mt-4">
          <div
            className="h-3 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-label="Links learned"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="h-full rounded-full bg-good transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-center text-sm font-bold text-muted">
            {status !== "ready"
              ? " "
              : links.length === 0
                ? "Add your first link to get started!"
                : leftCount === 0
                  ? "Wow! You learned everything! 🎉"
                  : learnedCount === 0
                    ? "Tap “✓ Learned” when you finish a link."
                    : `Great job! You learned ${learnedCount} of ${links.length} links.`}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-3xl border border-line bg-surface shadow-card lg:sticky lg:top-6">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
            aria-controls="add-link-form"
            className="flex min-h-14 w-full items-center justify-between gap-3 rounded-3xl px-5 py-4 text-left text-lg font-black lg:hidden"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-brand text-2xl leading-none text-brand-ink">
                {formOpen ? "−" : "+"}
              </span>
              Add a new link
            </span>
            <span aria-hidden className={`text-muted transition ${formOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          <div id="add-link-form" className={`px-5 pb-5 lg:block lg:pt-5 ${formOpen ? "block" : "hidden"}`}>
            <h2 className="mb-4 hidden text-xl font-black lg:block">Add a new link</h2>
            <LinkForm defaultSubject={filter === "all" ? null : filter} onSaved={handleSaved} />
          </div>
        </aside>

        <section aria-labelledby="links-heading" className="min-w-0">
          <h2 id="links-heading" className="sr-only">
            My links
          </h2>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <FilterTab id="all" icon="📚" label="All" count={links.length} active={filter === "all"} onSelect={setFilter} />
            {SUBJECTS.map((s) => (
              <FilterTab
                key={s.id}
                id={s.id}
                icon={s.icon}
                label={s.label}
                count={countBySubject[s.id] ?? 0}
                active={filter === s.id}
                onSelect={setFilter}
              />
            ))}
          </div>

          <div className="relative mt-3">
            <label htmlFor="search" className="sr-only">
              Search links
            </label>
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg">
              🔍
            </span>
            <input
              id="search"
              type="search"
              placeholder="Search my links…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface py-3 pr-4 pl-12 text-base shadow-card placeholder:text-muted/70 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="mt-4" aria-live="polite" aria-busy={status === "loading"}>
            {status === "loading" && <LoadingCards />}

            {status === "error" && (
              <Empty icon="📡" title="Could not load your links" text="Check your internet, then try again.">
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-4 min-h-11 rounded-2xl bg-brand px-5 font-extrabold text-brand-ink"
                >
                  Try again
                </button>
              </Empty>
            )}

            {status === "ready" && visible.length === 0 && (
              <Empty
                icon={query ? "🤔" : "🪹"}
                title={query ? "No links found" : `No links in ${filterLabel} yet`}
                text={query ? `Nothing matches “${query.trim()}”. Try another word.` : "Use the form to add one!"}
              >
                {(query || filter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                    className="mt-4 min-h-11 rounded-2xl border-2 border-line bg-surface px-5 font-extrabold hover:bg-surface-2"
                  >
                    Show all links
                  </button>
                )}
              </Empty>
            )}

            {status === "ready" && visible.length > 0 && (
              <>
                <p className="mb-3 text-sm font-bold text-muted">
                  Showing {visible.length} {visible.length === 1 ? "link" : "links"}
                  {filter !== "all" && ` in ${filterLabel}`} · Tap a title to open it
                </p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {visible.map((link) => (
                    <li key={link.id} className="flex">
                      <div className="w-full">
                        <LinkCard
                          link={link}
                          busy={busyIds.has(link.id)}
                          onToggleLearned={toggleLearned}
                          onRemove={setToDelete}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      <ConfirmDelete link={toDelete} onCancel={() => setToDelete(null)} onConfirm={removeLink} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {toast && (
          <p className="pop-in rounded-full bg-ink px-5 py-3 font-extrabold text-bg shadow-2xl">{toast}</p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | null; tone: "brand" | "good" | "study" }) {
  const color = { brand: "text-brand", good: "text-good", study: "text-[var(--math)]" }[tone];
  return (
    <div className="rounded-2xl bg-surface-2 px-2 py-3">
      <dd className={`text-3xl font-black tabular-nums sm:text-4xl ${color}`}>{value ?? "–"}</dd>
      <dt className="text-xs font-extrabold text-muted sm:text-sm">{label}</dt>
    </div>
  );
}

function FilterTab(props: {
  id: Filter;
  icon: string;
  label: string;
  count: number;
  active: boolean;
  onSelect: (id: Filter) => void;
}) {
  const { id, icon, label, count, active, onSelect } = props;
  return (
    <button
      type="button"
      data-subject={id}
      aria-pressed={active}
      onClick={() => onSelect(id)}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-extrabold whitespace-nowrap transition active:scale-95 ${
        active
          ? "border-subject-ink bg-subject-ink text-surface"
          : "border-line bg-surface text-ink hover:border-subject hover:bg-subject-soft"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
      <span
        className={`min-w-6 rounded-full px-1.5 text-xs tabular-nums ${
          active ? "bg-surface/20" : "bg-subject-soft text-subject-ink"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Empty({ icon, title, text, children }: { icon: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line bg-surface/60 px-6 py-12 text-center">
      <div aria-hidden className="text-5xl">
        {icon}
      </div>
      <p className="mt-3 text-xl font-black">{title}</p>
      <p className="mt-1 text-muted">{text}</p>
      {children}
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading links">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-56 animate-pulse rounded-3xl border border-line bg-surface" />
      ))}
    </div>
  );
}
