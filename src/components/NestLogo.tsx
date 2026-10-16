export function NestLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="16" fill="var(--brand-soft)" />
      <ellipse cx="22" cy="31" rx="7" ry="9" fill="#93c5fd" />
      <ellipse cx="42" cy="31" rx="7" ry="9" fill="#fde68a" />
      <ellipse cx="32" cy="28" rx="7.5" ry="10" fill="#ffffff" stroke="#e7d3bb" strokeWidth="1.5" />
      <path d="M8 34h48c0 12-10.7 20-24 20S8 46 8 34z" fill="#a16207" />
      <path
        d="M11 38c7 3 35 3 42 0M13 44c6 3 32 3 38 0M18 49c5 2 23 2 28 0"
        stroke="#713f12"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
