"use client";

import { useEffect, useRef } from "react";
import type { LearningLink } from "@/lib/subjects";

type Props = {
  link: LearningLink | null;
  onCancel: () => void;
  onConfirm: (link: LearningLink) => void;
};

export function ConfirmDelete({ link, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (link && !dialog.open) dialog.showModal();
    if (!link && dialog.open) dialog.close();
  }, [link]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      aria-labelledby="delete-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl"
    >
      {link && (
        <div className="p-6 text-center">
          <div aria-hidden className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-danger-soft text-3xl">
            🗑️
          </div>
          <h2 id="delete-title" className="text-2xl font-black">
            Delete this link?
          </h2>
          <p className="mt-2 break-words text-muted">
            “{link.title}” will be removed for good.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              autoFocus
              onClick={onCancel}
              className="min-h-12 flex-1 rounded-2xl border-2 border-line bg-surface px-4 font-extrabold hover:bg-surface-2"
            >
              No, keep it
            </button>
            <button
              type="button"
              onClick={() => onConfirm(link)}
              className="min-h-12 flex-1 rounded-2xl bg-danger px-4 font-extrabold text-danger-ink hover:brightness-110"
            >
              Yes, delete
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
