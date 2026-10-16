"use client";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-11 min-w-11 shrink-0 justify-center items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-bold text-ink shadow-card transition hover:bg-surface-2 active:scale-95"
    >
      <span aria-hidden className="text-lg dark:hidden">🌙</span>
      <span aria-hidden className="hidden text-lg dark:inline">☀️</span>
      <span className="sr-only sm:not-sr-only dark:hidden">Dark</span>
      <span className="sr-only sm:not-sr-only not-dark:hidden">Light</span>
      <span className="sr-only"> mode</span>
    </button>
  );
}
